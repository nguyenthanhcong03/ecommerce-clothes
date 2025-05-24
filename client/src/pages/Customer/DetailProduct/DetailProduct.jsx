import facebook from '@/assets/icons/facebook.png';
import instagram from '@/assets/icons/instagram.png';
import messenger from '@/assets/icons/messenger.png';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Button from '@/components/common/Button/Button';
import Collapse from '@/components/common/Collapse/Collapse';
import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import ColorSelector from '@/components/product/ColorSelector/ColorSelector';
import useProductVariants from '@/hooks/useProductVariants';
import ProductDescription from '@/pages/customer/DetailProduct/components/ProductDescription';
import ProductReview from '@/pages/customer/DetailProduct/components/ProductReview';
import RelatedProducts from '@/pages/customer/DetailProduct/components/RelatedProducts';
import { addToCart } from '@/store/slices/cartSlice';
import { getCategoriesTree } from '@/store/slices/categorySlice';
import { setOrderItems } from '@/store/slices/orderSlice';
import { fetchProductById } from '@/store/slices/productSlice';
import { COLOR_OPTIONS } from '@/utils/constants';
import { getCategoryPath } from '@/utils/helpers/getCategoryPath';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const getImageUrl = (image) => {
  return typeof image === 'string' ? image : image?.url || '';
};

const DetailProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentProduct: product, loading, error } = useSelector((state) => state.product);
  const { categoriesTree } = useSelector((state) => state.category);
  // const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const [selectedSize, setSelectedSize] = useState('');
  // const [selectedColor, setSelectedColor] = useState('');
  // const [quantity, setQuantity] = useState(1);
  // const [showValidation, setShowValidation] = useState(false);

  const {
    selectedSize,
    selectedColor,
    quantity,
    setQuantity,
    showValidation,
    setShowValidation,
    currentImageIndex,
    setCurrentImageIndex,
    allImages,
    setAllImages,
    colorImageIndexMap,
    setColorImageIndexMap,
    variantOptions,
    getAvailableColors,
    getAvailableSizes,
    handleSizeSelect,
    handleColorSelect,
    getSelectedPrice
  } = useProductVariants(product);

  const { price, discountPrice, stock } = getSelectedPrice();

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  // Generate breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        label: 'Cửa hàng',
        path: '/shop'
      }
    ];
    if (product?.categoryId?._id && categoriesTree) {
      const categoryPath = getCategoryPath(categoriesTree, product.categoryId._id);
      const pathItems = categoryPath.map((cat, index) => ({
        label: cat.name,
        path: index === categoryPath.length - 1 ? null : `/shop/${cat.slug}/${cat._id}`
      }));
      items.push(...pathItems);
    }

    if (product) {
      items.push({ label: product.name, path: null });
    }

    return items;
  }, [product, categoriesTree]);

  // // Tính toán available options
  // const variantOptions = useMemo(() => {
  //   if (!product?.variants) return { sizes: [], colors: [], sizeMap: new Map(), colorMap: new Map() };
  //   const sizeMap = new Map();
  //   const colorMap = new Map();

  //   product.variants.forEach((variant) => {
  //     // Map size to colors
  //     if (!sizeMap.has(variant.size)) {
  //       sizeMap.set(variant.size, new Set());
  //     }
  //     sizeMap.get(variant.size).add(variant.color);

  //     // Map color to sizes
  //     if (!colorMap.has(variant.color)) {
  //       colorMap.set(variant.color, new Set());
  //     }
  //     colorMap.get(variant.color).add(variant.size);
  //   });

  //   return {
  //     sizes: Array.from(sizeMap.keys()),
  //     colors: Array.from(colorMap.keys()),
  //     sizeMap,
  //     colorMap
  //   };
  // }, [product?.variants]);

  // const getAvailableColors = (size) => {
  //   return Array.from(variantOptions.sizeMap.get(size) || []);
  // };

  // const getAvailableSizes = (color) => {
  //   return Array.from(variantOptions.colorMap.get(color) || []);
  // };

  // const handleSizeSelect = (size) => {
  //   // Nếu click vào size đang được chọn thì bỏ chọn
  //   if (selectedSize === size) {
  //     setSelectedSize('');
  //     setQuantity(1); // Reset quantity khi bỏ chọn size
  //     setShowValidation(false);
  //     return;
  //   }

  //   setSelectedSize(size);
  //   setQuantity(1); // Reset quantity khi bỏ chọn size

  //   // Kiểm tra nếu color hiện tại không có trong size mới thì reset color
  //   if (!variantOptions.sizeMap.get(size)?.has(selectedColor)) {
  //     setSelectedColor('');
  //     setQuantity(1); // Reset quantity khi bỏ chọn size
  //   }
  // };

  // const handleColorSelect = (color) => {
  //   // Nếu click vào color đang được chọn thì bỏ chọn
  //   if (selectedColor === color) {
  //     setSelectedColor('');
  //     setQuantity(1); // Reset quantity khi bỏ chọn size
  //     setShowValidation(false);
  //     return;
  //   }

  //   setSelectedColor(color);
  //   setQuantity(1); // Reset quantity khi bỏ chọn size

  //   // Kiểm tra nếu size hiện tại không có trong color mới thì reset size
  //   if (!variantOptions.colorMap.get(color)?.has(selectedSize)) {
  //     setSelectedSize('');
  //     setQuantity(1); // Reset quantity khi bỏ chọn size
  //   }
  // };

  // // Hàm lấy giá dựa trên size và color được chọn
  // const getSelectedPrice = () => {
  //   if (selectedSize && selectedColor) {
  //     const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
  //     if (selectedVariant) {
  //       return {
  //         price: selectedVariant.price,
  //         discountPrice: selectedVariant.discountPrice,
  //         stock: selectedVariant.stock,
  //         selectedVariant
  //       };
  //     }
  //   }

  //   // Giá mặc định (giá thấp nhất)
  //   let defaultVariant = null;
  //   if (product.variants && product.variants.length > 0) {
  //     defaultVariant = product?.variants.reduce((min, variant) => (!min || variant.price < min.price ? variant : min));
  //   }

  //   return {
  //     price: defaultVariant?.price || 0,
  //     discountPrice: defaultVariant?.discountPrice || null
  //   };
  // };

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
    setShowValidation(false);
  };

  // const handleProceedToCheckout = () => {
  //   if (!selectedSize || !selectedColor) {
  //     setShowValidation(true);
  //     return;
  //   }
  //   const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);

  //   const orderItems = [
  //     {
  //       productId: product._id,
  //       variantId: selectedVariant._id,
  //       quantity: quantity,
  //       snapshot: {
  //         name: product.name,
  //         price: selectedVariant.price,
  //         discountPrice: selectedVariant.discountPrice,
  //         color: selectedVariant.color,
  //         size: selectedVariant.size,
  //         image:
  //           selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images[0] : product.images[0]
  //       }
  //     }
  //   ];
  //   // Lưu các sản phẩm đã chọn vào localStorage
  //   localStorage.setItem('orderItems', JSON.stringify(orderItems));

  //   // Đặt các sản phẩm đã chọn vào trạng thái đơn hàng
  //   dispatch(setOrderItems(orderItems));

  //   // Chuyển hướng đến trang thanh toán
  //   navigate('/checkout');
  // };

  // Hàm xử lý sự kiện khi nhấn nút "Mua ngay"
  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      setShowValidation(true);
      return;
    }

    const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
    const imageUrl = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '';

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
          image: imageUrl
        }
      }
    ];

    // Lưu các sản phẩm đã chọn vào localStorage
    localStorage.setItem('orderItems', JSON.stringify(orderItems));
    dispatch(setOrderItems(orderItems));
    navigate('/checkout');
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-primaryColor border-t-transparent'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-xl font-medium text-red-500'>Không thể tải sản phẩm</h2>
          <p className='mt-2 text-gray-600'>Vui lòng thử lại sau</p>
          <Button variant='primary' className='mt-4' onClick={() => navigate('/shop')}>
            Quay lại trang sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-xl font-medium'>Không tìm thấy sản phẩm</h2>
          <Button variant='primary' className='mt-4' onClick={() => navigate('/shop')}>
            Quay lại trang sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-[60px] sm:mt-[80px]'>
      {/* Breadcrumb */}
      <div className=''>
        <Breadcrumb separator='/' items={breadcrumbItems} />
      </div>
      <div className='mx-auto rounded-sm bg-white'>
        <div className='flex flex-col flex-wrap md:flex-row'>
          {/* Left Column - Product Images */}
          <div className='w-full p-2 md:w-2/5 md:p-4'>
            <div className='flex flex-col gap-2 sm:gap-3'>
              <div className='aspect-w-1 aspect-h-1 w-full'>
                <img
                  src={allImages[currentImageIndex] || product.images[0]}
                  alt={product.name}
                  className='h-[300px] w-full object-cover sm:h-[400px] md:h-[450px]'
                />
              </div>
              <div className='grid grid-cols-4 gap-1 overflow-x-auto sm:grid-cols-5 sm:gap-2'>
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-fit w-fit border-2 ${currentImageIndex === index ? 'border-black' : 'border-transparent'}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className='h-[60px] w-[60px] object-cover sm:h-[82px] sm:w-[82px]'
                    />
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
            <div className='flex items-center justify-center gap-4 pt-3 text-sm sm:gap-7 sm:pt-4 sm:text-base'>
              <div className='flex items-center'>
                <span className='xs:inline mr-1 hidden'>Chia sẻ:</span>
                <div className='flex items-center gap-1'>
                  <button>
                    <img src={facebook} alt='Chia sẻ với Facebook' className='h-6 w-6' />
                  </button>
                  <button>
                    <img src={instagram} alt='Chia sẻ với Instagram' className='h-6 w-6' />
                  </button>
                  <button>
                    <img src={messenger} alt='Chia sẻ với Messenger' className='h-6 w-6' />
                  </button>
                </div>
              </div>
              <span className='xs:inline hidden text-gray-300'>|</span>
              <div className='flex items-center'>
                <button>
                  <Heart strokeWidth={1} className='mr-1' width={20} height={20} />
                </button>
                <span className='xs:inline hidden'>Yêu thích</span>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className='w-full p-2 md:w-3/5 md:p-4'>
            <div>
              <h1 className='text-xl font-normal sm:text-2xl'>{product.name}</h1>
              <div className='mt-2 flex items-center space-x-2'>
                <div className='flex items-center'>
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400 sm:h-5 sm:w-5' />
                  <span className='ml-1 text-xs text-gray-600 sm:text-sm'>
                    {product.averageRating} ({product.totalReviews} đánh giá)
                  </span>
                </div>
                <span className='text-gray-300'>|</span>
                <span className='text-xs text-gray-600 sm:text-sm'>{product.sku} Lượt bán</span>
              </div>
            </div>

            <div className='my-2 flex items-center gap-2 bg-[#F9F9F9] p-2 sm:my-3 sm:gap-4 sm:p-4'>
              <span className='text-xl font-medium sm:text-3xl'>
                {price.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
              </span>
              {discountPrice && (
                <span className='ml-1 text-sm text-gray-400 line-through sm:ml-2 sm:text-lg'>
                  {discountPrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  })}
                </span>
              )}

              {/* {(() => {
                const { price, discountPrice } = getSelectedPrice();
                return (
                  <>
                    <span className='text-xl font-medium sm:text-3xl'>
                      {price.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      })}
                    </span>
                    {discountPrice && (
                      <span className='ml-1 text-sm text-gray-400 line-through sm:ml-2 sm:text-lg'>
                        {discountPrice.toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        })}
                      </span>
                    )}
                  </>
                );
              })()} */}
            </div>

            <div className='flex flex-col gap-2 p-2 sm:flex-row sm:p-4'>
              <h3 className='min-w-[80px] text-xs text-[#757575] sm:text-sm'>Vận chuyển</h3>
              <div className='text-xs sm:text-sm'>Nhận từ 19 Th04 - 21 Th04 Miễn phí vận chuyển</div>
            </div>

            <div className='flex flex-col gap-2 p-2 sm:flex-row sm:p-4'>
              <h3 className='min-w-[80px] text-xs text-[#757575] sm:text-sm'>An tâm mua sắm</h3>
              <div className='text-xs sm:text-sm'>7 ngày miễn phí trả hàng</div>
            </div>

            {/* Size và color */}
            <div
              className={`flex flex-col gap-2 px-2 py-1 sm:px-4 sm:py-2 ${showValidation && (!selectedSize || !selectedColor) ? 'bg-red-50' : ''}`}
            >
              <div className='flex flex-col gap-2 sm:gap-3'>
                <div>
                  <h3 className='text-xs text-[#757575] sm:text-sm'>Size</h3>
                  <div className='mt-1 flex flex-wrap gap-1 sm:mt-2 sm:gap-2'>
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
                          className={`h-[28px] min-w-[28px] border text-xs text-primaryColor sm:h-[30px] sm:min-w-[30px] ${
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

                {variantOptions && variantOptions.colors && (
                  <div>
                    <h3 className='text-xs text-[#757575] sm:text-sm'>Màu sắc: {selectedColor}</h3>
                    {/* <div className='mt-1 flex flex-wrap gap-1 sm:mt-2 sm:gap-2'>
                    {variantOptions.colors.map((color) => {
                      const isAvailable = !selectedSize || getAvailableColors(selectedSize).includes(color);
                      const colorObj = COLOR_OPTIONS.find((c) => c.name === color);
                      const hex = colorObj?.hex || '#ccc';

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
                          <div className='h-full w-full rounded-full' style={{ backgroundColor: hex }} title={color} />
                        </button>
                      );
                    })}
                  </div> */}
                    <ColorSelector
                      colors={variantOptions?.colors}
                      selectedColor={selectedColor}
                      selectedSize={selectedSize}
                      colorImageIndexMap={colorImageIndexMap}
                      setCurrentImageIndex={setCurrentImageIndex}
                      getAvailableColors={getAvailableColors}
                      onColorSelect={handleColorSelect}
                    />
                  </div>
                )}

                <div>
                  <h3 className='text-xs text-[#757575] sm:text-sm'>Số lượng</h3>
                  <div className='mt-1 flex items-center space-x-4 sm:mt-2'>
                    <QuantityInput
                      value={quantity}
                      min={1}
                      max={stock}
                      onChange={(newQuantity) => handleQuantityChange(newQuantity)}
                    />

                    {selectedSize && selectedColor && stock ? (
                      <span className='text-xs text-gray-500 sm:text-sm'>{stock} sản phẩm có sẵn</span>
                    ) : (
                      <span className='text-xs text-gray-500 sm:text-sm'>
                        {product.variants.reduce((sum, variant) => sum + variant.stock, 0)} sản phẩm có sẵn
                      </span>
                    )}
                    {/* {(() => {
                      const { stock } = getSelectedPrice();
                      return (
                        <>
                          <QuantityInput
                            value={quantity}
                            min={1}
                            max={stock}
                            onChange={(newQuantity) => handleQuantityChange(newQuantity)}
                          />

                          {selectedSize && selectedColor && stock && (
                            <span className='text-xs text-gray-500 sm:text-sm'>Còn {stock} sản phẩm</span>
                          )}
                        </>
                      );
                    })()} */}
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

            <div className='m-2 flex flex-col gap-3 sm:m-4 sm:gap-4 lg:flex-row'>
              <Button variant='secondary' onClick={handleAddToCart} className='xs:flex-1 w-full'>
                <ShoppingCart strokeWidth={1} className='mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5' />
                <span className='text-sm'>Thêm vào giỏ hàng</span>
              </Button>
              <Button variant='primary' onClick={handleBuyNow} className='xs:flex-1 w-full'>
                <span className='text-sm'>
                  Mua ngay với giá{' '}
                  {getSelectedPrice().price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  })}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ProductDescription product={product} />
      <ProductReview product={product} />
      <RelatedProducts productId={product._id} />
    </div>
  );
};

export default DetailProduct;
