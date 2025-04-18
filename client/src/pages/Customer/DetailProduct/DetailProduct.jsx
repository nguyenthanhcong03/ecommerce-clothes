import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Button from '@/components/common/Button/Button';
import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { fetchProductById } from '@/redux/features/product/productSlice';
import { Facebook, Heart, ShoppingCart, Star } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import facebook from '@/assets/icons/facebook.png';
import instagram from '@/assets/icons/instagram.png';
import messenger from '@/assets/icons/messenger.png';
import Collapse from '../../../components/common/Collapse/Collapse';

const DetailProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentProduct: product, status } = useSelector((state) => state.product);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  // Tính toán available options
  const variantOptions = useMemo(() => {
    if (!product?.variants) return { sizes: [], colors: [], sizeMap: new Map(), colorMap: new Map() };
    const sizeMap = new Map();
    const colorMap = new Map();

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
    });

    return {
      sizes: Array.from(sizeMap.keys()),
      colors: Array.from(colorMap.keys()),
      sizeMap,
      colorMap
    };
  }, [product?.variants]);

  const getAvailableColors = (size) => {
    return Array.from(variantOptions.sizeMap.get(size) || []);
  };

  const getAvailableSizes = (color) => {
    return Array.from(variantOptions.colorMap.get(color) || []);
  };

  const handleSizeSelect = (size) => {
    // Nếu click vào size đang được chọn thì bỏ chọn
    if (selectedSize === size) {
      setSelectedSize('');
      setQuantity(1); // Reset quantity khi bỏ chọn size
      setShowValidation(false);
      return;
    }

    setSelectedSize(size);
    setQuantity(1); // Reset quantity khi bỏ chọn size

    // Kiểm tra nếu color hiện tại không có trong size mới thì reset color
    if (!variantOptions.sizeMap.get(size)?.has(selectedColor)) {
      setSelectedColor('');
      setQuantity(1); // Reset quantity khi bỏ chọn size
    }
  };

  const handleColorSelect = (color) => {
    // Nếu click vào color đang được chọn thì bỏ chọn
    if (selectedColor === color) {
      setSelectedColor('');
      setQuantity(1); // Reset quantity khi bỏ chọn size
      setShowValidation(false);
      return;
    }

    setSelectedColor(color);
    setQuantity(1); // Reset quantity khi bỏ chọn size

    // Kiểm tra nếu size hiện tại không có trong color mới thì reset size
    if (!variantOptions.colorMap.get(color)?.has(selectedSize)) {
      setSelectedSize('');
      setQuantity(1); // Reset quantity khi bỏ chọn size
    }
  };

  // Hàm lấy giá dựa trên size và color được chọn
  const getSelectedPrice = () => {
    if (selectedSize && selectedColor) {
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
    const defaultVariant = product?.variants.reduce((min, variant) =>
      !min || variant.price < min.price ? variant : min
    );
    return {
      price: defaultVariant?.price,
      discountPrice: defaultVariant?.discountPrice
    };
  };

  // const { price, discountPrice } = getSelectedPrice();
  console.log('price');

  // Hàm xử lý sự kiện khi nhấn nút "Thêm vào giỏ hàng"
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setShowValidation(true);
      return;
    }
    const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);

    const cartItem = {
      productId: product._id,
      variantId: selectedVariant._id,
      quantity: 1,
      snapshot: {
        name: product.name,
        price: selectedVariant.price,
        discountPrice: selectedVariant.discountPrice,
        color: selectedVariant.color,
        size: selectedVariant.size,
        image: product.images[0]
      }
    };
    // dispatch(addToCart(cartItem));
    // dispatch(addToCart(product));
    setShowValidation(false);
  };

  // Hàm xử lý sự kiện khi nhấn nút "Mua ngay"
  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      setShowValidation(true);
      return;
    }
    handleAddToCart();
    navigate('/cart');
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);

    // try {
    //   await dispatch(
    //     updateCartItem({
    //       productId: item.productId,
    //       variantId: item.variantId,
    //       quantity: newQuantity
    //     })
    //   ).unwrap();
    // } catch (error) {
    //   toast.error('Cập nhật số lượng thất bại');
    // }
  };

  const breadcrumbItems = [
    { label: 'Outfitory', path: '/' },
    { label: 'Sản phẩm', path: '/shop' },
    // Nếu có category
    ...(product?.categoryId ? [{ label: product.categoryId.name, path: `/category/${product.categoryId}` }] : []),
    { label: product?.name || 'Chi tiết sản phẩm' }
  ];

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error loading product</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className='mx-auto mt-[80px] w-full max-w-[1280px] p-4'>
      {/* Breadcrumb */}
      <div className='mb-6'>
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className='mx-auto'>
        <div className='flex flex-wrap'>
          {/* Left Column - Product Images */}
          <div className='w-2/5 p-4'>
            <div className='flex flex-col gap-3'>
              <div className='aspect-w-1 aspect-h-1 w-full'>
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className='h-[450px] w-[450px] object-cover'
                />
              </div>
              <div className='grid grid-cols-4 gap-2'>
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-fit w-fit border-2 ${currentImageIndex === index ? 'border-black' : 'border-transparent'}`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className='h-[82px] w-[82px] object-cover' />
                  </button>
                ))}
              </div>
            </div>
            <div className='flex items-center justify-center gap-7 pt-4 text-base'>
              <div className='flex items-center'>
                <span className='mr-1'>Chia sẻ:</span>
                <div className='flex items-center gap-1'>
                  <button>
                    <img src={facebook} alt='Chia sẻ với Facebook' />
                  </button>
                  <button>
                    <img src={instagram} alt='Chia sẻ với Instagram' />
                  </button>
                  <button>
                    <img src={messenger} alt='Chia sẻ với Messenger' />
                  </button>
                </div>
              </div>
              <span className='text-gray-300'>|</span>
              <div className='flex items-center'>
                <button>
                  <Heart strokeWidth={1} className='mr-1' width={24} />
                </button>
                <span>Yêu thích</span>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className='w-3/5 p-4'>
            <div>
              <h1 className='text-2xl font-normal'>{product.name}</h1>
              <div className='mt-2 flex items-center space-x-2'>
                <div className='flex items-center'>
                  <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                  <span className='ml-1 text-sm text-gray-600'>
                    {product.averageRating} ({product.totalReviews} đánh giá)
                  </span>
                </div>
                <span className='text-gray-300'>|</span>
                <span className='text-sm text-gray-600'>{product.sku} Lượt bán</span>
              </div>
            </div>

            <div className='my-3 flex items-center gap-4 bg-[#F9F9F9] p-4'>
              {(() => {
                const { price, discountPrice } = getSelectedPrice();
                return (
                  <>
                    <span className='text-3xl font-medium'>
                      {price.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      })}
                    </span>
                    {discountPrice && (
                      <span className='ml-2 text-lg text-gray-400 line-through'>
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

            <div className='flex p-4'>
              <h3 className='text-sm text-[#757575]'>Vận chuyển</h3>
              <div>Nhận từ 19 Th04 - 21 Th04 Miễn phí vận chuyển</div>
            </div>

            <div className='flex p-4'>
              <h3 className='text-sm text-[#757575]'>An tâm mua sắm cùng Outfitory</h3>
              <div>Nhận từ 19 Th04 - 21 Th04 Miễn phí vận chuyển</div>
            </div>

            {/* Size và color */}
            <div
              className={`flex flex-col gap-2 px-4 py-2 ${showValidation && (!selectedSize || !selectedColor) ? 'bg-red-50' : ''}`}
            >
              <div className='flex flex-col gap-3'>
                <div>
                  <h3 className='text-sm text-[#757575]'>Size</h3>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {variantOptions.sizes.map((size) => {
                      const isAvailable = !selectedColor || getAvailableSizes(selectedColor).includes(size);
                      return (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSizeSelect(size);
                          }}
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
                  <h3 className='text-sm text-[#757575]'>Màu sắc: {selectedColor}</h3>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {variantOptions.colors.map((color) => {
                      const isAvailable = !selectedSize || getAvailableColors(selectedSize).includes(color);
                      return (
                        <button
                          key={color}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleColorSelect(color);
                          }}
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
                  <h3 className='text-sm text-[#757575]'>Số lượng</h3>
                  <div className='mt-2 flex items-center space-x-2'>
                    {(() => {
                      const { stock } = getSelectedPrice();
                      return (
                        <>
                          <QuantityInput
                            size='small'
                            value={quantity}
                            onChange={(quantity) => handleQuantityChange(product, quantity)}
                            disabled={!selectedSize || !selectedColor}
                            min={1}
                            max={stock}
                          />
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
            </div>

            <div className='m-4 flex gap-4'>
              <Button variant='secondary' onClick={handleAddToCart}>
                <ShoppingCart strokeWidth={1} className='mr-2' />
                Thêm vào giỏ hàng
              </Button>
              <Button variant='primary' onClick={handleBuyNow}>
                Mua ngay với giá{' '}
                {getSelectedPrice().price.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-4 space-y-4 p-4'>
        <Collapse title='CHI TIẾT SẢN PHẨM' className='bg-[#F7F7F7]' isShow={true}>
          <div className='space-y-6 rounded bg-white p-4 text-sm'>
            {/* Thông tin danh mục và thương hiệu */}
            <div className='grid grid-cols-4 items-center gap-4'>
              <h4 className='text-[#888888]'>Danh mục</h4>
              <p className=''>{product.categoryId?.name}</p>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <h4 className='text-[#888888]'>Thương hiệu</h4>
              <p className=''>{product.brand}</p>
            </div>

            {/* Thông tin các biến thể */}
            {/* product.variants.map((v) => v.size): lấy ra mảng chứa tất cả các size, ví dụ: ["M", "L", "M", "S"].
            new Set(...): loại bỏ các phần tử trùng lặp → ["M", "L", "S"].
            Array.from(...): chuyển Set trở lại thành mảng để .map() được.
            .map(...): lặp qua từng size duy nhất và hiển thị nó trong một thẻ <span>. */}
            <div className='grid grid-cols-4 items-center gap-4'>
              <h4 className='text-[#888888]'>Kích thước có sẵn</h4>
              <div className='flex flex-wrap gap-2'>
                {Array.from(new Set(product.variants.map((v) => v.size))).map((size) => (
                  <span key={size} className='rounded bg-gray-100 px-3 py-1 text-sm'>
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <h4 className='text-[#888888]'>Màu sắc có sẵn</h4>
              <div className='flex flex-wrap gap-2'>
                {Array.from(new Set(product.variants.map((v) => v.color))).map((color) => (
                  <span key={color} className='rounded bg-gray-100 px-3 py-1 text-sm'>
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <h4 className='text-[#888888]'>Số lượng sản phẩm</h4>
              <p className=''>Tổng số: {product.variants.reduce((sum, variant) => sum + variant.stock, 0)} sản phẩm</p>
            </div>
          </div>
        </Collapse>

        <Collapse title='MÔ TẢ SẢN PHẨM' className='bg-[#F7F7F7]' isShow={true}>
          <div className='rounded bg-white p-4'>
            <div className='prose prose-sm max-w-none whitespace-pre-line text-sm'>{product.description}</div>
          </div>
        </Collapse>
        <Collapse title='ĐÁNH GIÁ SẢN PHẨM' className='bg-[#F7F7F7]' isShow={true}>
          <div className='rounded bg-white p-4'>
            <div className='prose prose-sm max-w-none whitespace-pre-line text-sm'>{product.description}</div>
          </div>
        </Collapse>
      </div>
      <div>
        <h2 className='my-4 text-center text-2xl'>CÓ THỂ BẠN SẼ THÍCH</h2>
        <div>product</div>
      </div>
    </div>
  );
};

export default DetailProduct;
