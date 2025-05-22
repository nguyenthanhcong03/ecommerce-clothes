import Button from '@/components/common/Button/Button';
import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import { addToCart } from '@/store/slices/cartSlice';
import { closeProductDetailModal, fetchProductById } from '@/store/slices/productSlice';
import { ShoppingCart, Star, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOrderItems } from '../../../store/slices/orderSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProductDetailModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDetailModalOpen, modalProductId, currentProduct: product, status } = useSelector((state) => state.product);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const [colorImageIndexMap, setColorImageIndexMap] = useState({});

  useEffect(() => {
    if (isDetailModalOpen && modalProductId) {
      dispatch(fetchProductById(modalProductId));
    }
  }, [dispatch, isDetailModalOpen, modalProductId]);

  useEffect(() => {
    // Reset state when modal opens
    if (isDetailModalOpen) {
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
      setCurrentImageIndex(0);
      setShowValidation(false);
    }
  }, [isDetailModalOpen]);

  useEffect(() => {
    // Khởi tạo mảng hình ảnh khi sản phẩm được tải
    if (product) {
      // Tạo mảng chứa tất cả hình ảnh từ product và variants
      const productImages = product.images || [];
      const variantImages = [];
      const indexMap = {};

      // Thêm tất cả hình ảnh từ variants vào mảng
      if (product.variants) {
        product.variants.forEach((variant) => {
          if (variant.images && variant.images.length > 0) {
            // Lưu vị trí bắt đầu của hình ảnh variant trong mảng allImages
            indexMap[variant.color] = productImages.length + variantImages.length;
            variant.images.forEach((img) => {
              // Chỉ thêm hình ảnh nếu nó không trùng lặp
              if (!productImages.includes(img) && !variantImages.includes(img)) {
                variantImages.push(img);
              }
            });
          }
        });
      }

      // Kết hợp hình ảnh sản phẩm và variant
      const combined = [...productImages, ...variantImages];
      setAllImages(combined);
      setColorImageIndexMap(indexMap);
      setCurrentImageIndex(0);
    }
  }, [product]);

  const handleCloseModal = () => {
    dispatch(closeProductDetailModal());
  };

  // Calculate available options
  const variantOptions = React.useMemo(() => {
    if (!product?.variants)
      return { sizes: [], colors: [], sizeMap: new Map(), colorMap: new Map(), colorImageMap: new Map() };

    const sizeMap = new Map();
    const colorMap = new Map();
    const colorImageMap = new Map();

    product.variants.forEach((variant) => {
      // Map size to colors
      if (!sizeMap.has(variant.size)) {
        sizeMap.set(variant.size, new Set());
      }
      sizeMap.get(variant.size).add(variant.color);

      // Map color to sizes
      if (!colorMap.has(variant.color)) {
        colorMap.set(variant.color, new Set());
      }
      colorMap.get(variant.color).add(variant.size);

      // Map color to images
      if (variant.images && variant.images.length > 0) {
        colorImageMap.set(variant.color, variant.images);
      }
    });

    return {
      sizes: Array.from(sizeMap.keys()),
      colors: Array.from(colorMap.keys()),
      sizeMap,
      colorMap,
      colorImageMap
    };
  }, [product?.variants]);

  const getAvailableColors = (size) => {
    return Array.from(variantOptions.sizeMap.get(size) || []);
  };

  const getAvailableSizes = (color) => {
    return Array.from(variantOptions.colorMap.get(color) || []);
  };

  const handleSizeSelect = (size) => {
    // If clicking on the already selected size, unselect it
    if (selectedSize === size) {
      setSelectedSize('');
      setQuantity(1);
      setShowValidation(false);
      return;
    }

    setSelectedSize(size);
    setQuantity(1);

    // Check if the current color is available for the new size, if not reset color
    if (selectedColor && !variantOptions.sizeMap.get(size)?.has(selectedColor)) {
      setSelectedColor('');
      setQuantity(1);
    }
  };

  const handleColorSelect = (color) => {
    // If clicking on the already selected color, unselect it
    if (selectedColor === color) {
      setSelectedColor('');
      setQuantity(1);
      setShowValidation(false);
      setCurrentImageIndex(0); // Reset về ảnh chính đầu tiên khi bỏ chọn màu
      return;
    }

    setSelectedColor(color);
    setQuantity(1);

    // Hiển thị hình ảnh của màu được chọn bằng cách cập nhật currentImageIndex
    if (colorImageIndexMap[color] !== undefined) {
      setCurrentImageIndex(colorImageIndexMap[color]);
    }

    // Check if the current size is available for the new color, if not reset size
    if (selectedSize && !variantOptions.colorMap.get(color)?.has(selectedSize)) {
      setSelectedSize('');
      setQuantity(1);
    }
  };

  // Lấy giá và thông tin của sản phẩm đã chọn
  const getSelectedPrice = () => {
    if (selectedSize && selectedColor && product?.variants) {
      const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      if (selectedVariant) {
        return {
          price: selectedVariant.price,
          discountPrice: selectedVariant.discountPrice,
          stock: selectedVariant.stock,
          selectedVariant
        };
      }
    }
    // Giá mặc định (giá thấp nhất)
    const defaultVariant = product?.variants?.reduce((min, variant) =>
      !min || variant.price < min.price ? variant : min
    );
    return {
      price: defaultVariant?.price || 0,
      discountPrice: defaultVariant?.discountPrice || 0,
      stock: defaultVariant?.stock || 0
    };
  };

  const handleAddToCart = async () => {
    try {
      if (!selectedSize || !selectedColor) {
        setShowValidation(true);
        return;
      }

      const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);

      const cartItem = {
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: quantity,
        snapshot: {
          name: product.name,
          price: selectedVariant.price,
          discountPrice: selectedVariant.discountPrice,
          color: selectedVariant.color,
          size: selectedVariant.size,
          image:
            selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images[0] : product.images[0]
        }
      };
      await dispatch(addToCart(cartItem)).unwrap();
      toast.success('Thêm sản phẩm vào giỏ hàng thành công');
    } catch (error) {
      toast.error('Thêm sản phẩm vào giỏ hàng thất bại');
      console.log(error);
    }
    handleCloseModal();
  };

  const handleProceedToCheckout = () => {
    if (!selectedSize || !selectedColor) {
      setShowValidation(true);
      return;
    }
    const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);

    const orderItems = [
      {
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: quantity,
        snapshot: {
          name: product.name,
          price: selectedVariant.price,
          discountPrice: selectedVariant.discountPrice,
          color: selectedVariant.color,
          size: selectedVariant.size,
          image:
            selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images[0] : product.images[0]
        }
      }
    ];
    // Lưu các sản phẩm đã chọn vào localStorage
    localStorage.setItem('orderItems', JSON.stringify(orderItems));

    // Đặt các sản phẩm đã chọn vào trạng thái đơn hàng
    dispatch(setOrderItems(orderItems));
    handleCloseModal();

    // Chuyển hướng đến trang thanh toán
    navigate('/checkout');
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  if (!isDetailModalOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 z-40 bg-black bg-opacity-50 transition-all duration-300 ease-in'
        onClick={handleCloseModal}
      />

      {/* Modal */}
      <div className='fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90%] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-xl'>
        <X
          className='absolute right-4 top-4 cursor-pointer text-2xl text-primaryColor opacity-100 transition-all duration-150 ease-in hover:-rotate-90'
          onClick={handleCloseModal}
        />

        {status === 'loading' ? (
          <div className='flex h-64 items-center justify-center'>
            <div className='h-10 w-10 animate-spin rounded-full border-4 border-primaryColor border-t-transparent'></div>
          </div>
        ) : !product ? (
          <div className='flex h-64 items-center justify-center'>
            <p>Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Left Column - Product Images */}
            <div className='flex flex-col gap-3'>
              <div className='aspect-w-1 aspect-h-1 w-full'>
                <img
                  src={allImages[currentImageIndex] || product.images[0]}
                  alt={product.name}
                  className='h-64 w-full object-cover md:h-80'
                />
              </div>
              <div className='grid grid-cols-5 gap-2 overflow-x-auto'>
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-fit w-fit border-2 ${currentImageIndex === index ? 'border-black' : 'border-transparent'}`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className='h-14 w-14 object-cover' />
                  </button>
                ))}
              </div>

              {/* Hiển thị thông tin về ảnh hiện tại */}
              <div className='text-xs text-gray-500'>
                {selectedColor &&
                Object.keys(colorImageIndexMap).includes(selectedColor) &&
                currentImageIndex >= colorImageIndexMap[selectedColor] ? (
                  <p>Hình ảnh màu: {selectedColor}</p>
                ) : (
                  <p>Hình ảnh sản phẩm</p>
                )}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div>
              <div>
                <h1 className='text-xl font-medium'>{product.name}</h1>
                <div className='mt-2 flex items-center gap-2'>
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='ml-1 text-sm text-gray-600'>
                      {product.averageRating} ({product.totalReviews} đánh giá)
                    </span>
                  </div>
                </div>
              </div>

              <div className='my-4 flex items-center gap-4 bg-[#F9F9F9] p-3'>
                {(() => {
                  const { price, discountPrice } = getSelectedPrice();
                  return (
                    <>
                      <span className='text-2xl font-medium'>
                        {price?.toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        })}
                      </span>
                      {discountPrice && (
                        <span className='ml-2 text-sm text-gray-400 line-through'>
                          {discountPrice.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          })}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Size và color */}
              <div
                className={`flex flex-col gap-4 py-2 ${showValidation && (!selectedSize || !selectedColor) ? 'rounded bg-red-50 p-2' : ''}`}
              >
                <div>
                  <h3 className='text-sm font-medium'>Size</h3>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {variantOptions.sizes.map((size) => {
                      const isAvailable = !selectedColor || getAvailableSizes(selectedColor).includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          disabled={!isAvailable}
                          className={`h-[30px] min-w-[30px] border text-xs text-primaryColor ${
                            selectedSize === size
                              ? 'border-black'
                              : isAvailable
                                ? 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                                : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className='text-sm font-medium'>Màu sắc: {selectedColor}</h3>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {variantOptions.colors.map((color) => {
                      const isAvailable = !selectedSize || getAvailableColors(selectedSize).includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          disabled={!isAvailable}
                          className={`h-[25px] w-[25px] rounded-full border p-[2px] text-[10px] sm:text-xs ${
                            selectedColor === color
                              ? 'border-black'
                              : isAvailable
                                ? 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                                : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                          }`}
                        >
                          {color === 'Đỏ' && <div className='h-full w-full rounded-full border bg-red-500'></div>}
                          {color === 'Xanh' && <div className='h-full w-full rounded-full border bg-blue-500'></div>}
                          {color === 'Vàng' && <div className='h-full w-full rounded-full border bg-yellow-500'></div>}
                          {color === 'Trắng' && <div className='h-full w-full rounded-full border bg-white'></div>}
                          {color === 'Đen' && <div className='h-full w-full rounded-full border bg-black'></div>}
                          {color === 'Xám' && <div className='h-full w-full rounded-full border bg-gray-500'></div>}
                          {color === 'Xanh lá' && (
                            <div className='h-full w-full rounded-full border bg-green-500'></div>
                          )}
                          {color === 'Hồng' && <div className='h-full w-full rounded-full border bg-pink-500'></div>}
                          {color === 'Tím' && <div className='h-full w-full rounded-full border bg-purple-500'></div>}
                          {color === 'Cam' && <div className='h-full w-full rounded-full border bg-orange-500'></div>}
                          {color === 'Nâu' && <div className='h-full w-full rounded-full border bg-amber-950'></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className='text-sm font-medium'>Số lượng</h3>
                  <div className='mt-2 flex items-center space-x-2'>
                    {(() => {
                      const { stock } = getSelectedPrice();
                      return (
                        <>
                          <QuantityInput
                            size='small'
                            value={quantity}
                            onChange={handleQuantityChange}
                            disabled={!selectedSize || !selectedColor}
                            min={1}
                            max={stock}
                          />
                          {selectedSize && selectedColor && (
                            <span className='text-sm text-gray-500'>Còn {stock} sản phẩm</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {showValidation && (!selectedSize || !selectedColor) && (
                <p className='text-xs text-red-500'>
                  {!selectedSize && !selectedColor
                    ? 'Vui lòng chọn phân loại hàng'
                    : !selectedSize
                      ? 'Vui lòng chọn size'
                      : 'Vui lòng chọn màu sắc'}
                </p>
              )}

              <div className='mt-6 flex gap-4'>
                <Button variant='secondary' onClick={handleAddToCart} className='flex-1'>
                  <ShoppingCart strokeWidth={1} className='mr-2' />
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  variant='primary'
                  onClick={() => {
                    handleProceedToCheckout();
                  }}
                  className='flex-1'
                >
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailModal;
