import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import Button from '@/components/common/Button/Button';
import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import ColorSelector from '@/components/product/ColorSelector/ColorSelector';
import ShareButtons from '@/components/product/ShareButtons/ShareButtons';
import SizeSelector from '@/components/product/SizeSelector/SizeSelector';
import useProductVariants from '@/hooks/useProductVariants';
import ProductDescription from '@/pages/customer/ProductDetail/components/ProductDescription';
import ProductReview from '@/pages/customer/ProductDetail/components/ProductReview';
import RelatedProducts from '@/pages/customer/ProductDetail/components/RelatedProducts';
import { addToCart } from '@/store/slices/cartSlice';
import { setOrderItems } from '@/store/slices/orderSlice';
import { fetchProductById } from '@/store/slices/productSlice';
import { getCategoryPath } from '@/utils/helpers/getCategoryPath';
import { message } from 'antd';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

const getImageUrl = (image) => {
  return typeof image === 'string' ? image : image?.url || '';
};

const DetailProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentProduct: product, loadingFetchProductById, error } = useSelector((state) => state.product);
  const { categoriesTree } = useSelector((state) => state.category);
  const { isAuthenticated, user } = useSelector((state) => state.account);
  const isAdmin = isAuthenticated && user?.role === 'admin';

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
    variantOptions,
    getAvailableColors,
    getAvailableSizes,
    handleSizeSelect,
    handleColorSelect,
    getSelectedPrice
  } = useProductVariants(product);

  const { price, originalPrice, stock } = getSelectedPrice();

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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      message.error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
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
          originalPrice: selectedVariant.originalPrice,
          color: selectedVariant.color,
          size: selectedVariant.size,
          image:
            selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images[0] : product.images[0]
        }
      };
      await dispatch(addToCart(cartItem)).unwrap();
      message.success('Thêm sản phẩm vào giỏ hàng thành công');
    } catch (error) {
      message.error('Thêm sản phẩm vào giỏ hàng thất bại');
      console.log(error);
    }
    setShowValidation(false);
  };

  // Hàm xử lý sự kiện khi nhấn nút "Mua ngay"
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      message.error('Bạn cần đăng nhập để mua sản phẩm');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
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
          originalPrice: selectedVariant.originalPrice,
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

  if (loadingFetchProductById) {
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
    <div className='pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb separator='/' items={breadcrumbItems} />
      </div>
      <div className='mx-auto rounded-sm bg-white'>
        <div className='flex flex-col flex-wrap md:flex-row'>
          {/* Hình ảnh sản phẩm */}
          <div className='w-full p-3 md:w-2/5 md:p-6'>
            <div className='flex flex-col gap-4'>
              {/* Image Container */}
              <div className='group relative aspect-square w-full overflow-hidden rounded-sm border border-gray-200 bg-white'>
                <img
                  src={allImages[currentImageIndex] || (product.images && product.images[0])}
                  alt={product.name}
                  className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                />

                {/* Button mũi tên */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1)
                      }
                      className='absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-all hover:bg-white hover:shadow-lg'
                    >
                      <svg className='h-4 w-4 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1)
                      }
                      className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-all hover:bg-white hover:shadow-lg'
                    >
                      <svg className='h-4 w-4 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className='absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white'>
                  {currentImageIndex + 1} / {allImages.length}
                </div>

                {/* Zoom Icon */}
                <div className='absolute right-3 top-3 rounded-full bg-white/80 p-2 opacity-0 transition-opacity group-hover:opacity-100'>
                  <svg className='h-4 w-4 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
                    />
                  </svg>
                </div>
              </div>

              {/* Các ảnh nhỏ */}
              <div className='relative'>
                <div className='grid grid-cols-4 gap-2 sm:grid-cols-5'>
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`group relative aspect-square overflow-hidden rounded-sm border-2 transition-all duration-200 ${
                        currentImageIndex === index
                          ? 'border-[#333] ring-2 ring-[#333]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
                      />
                      {currentImageIndex === index && <div className='absolute inset-0 bg-[#333]/10'></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chấm tròn */}
              {allImages.length > 1 && (
                <div className='flex justify-center gap-1'>
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        currentImageIndex === index ? 'bg-[#333]' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mạng xã hội */}
            <div className='mt-6 flex items-center justify-between border-t border-gray-100 pt-4'>
              <ShareButtons product={product} />

              <button className='flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600'>
                <Heart strokeWidth={1.5} className='h-4 w-4' />
                <span className='hidden sm:inline'>Yêu thích</span>
              </button>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
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
                <span className='text-xs text-gray-600 sm:text-sm'>{product?.salesCount} Lượt bán</span>
              </div>
            </div>

            <div className='my-2 flex items-center gap-2 bg-[#F9F9F9] p-2 sm:my-3 sm:gap-4 sm:p-4'>
              <span className='text-xl font-medium sm:text-3xl'>
                {price.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
              </span>
              {originalPrice && (
                <span className='ml-1 text-sm text-gray-400 line-through sm:ml-2 sm:text-lg'>
                  {originalPrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  })}
                </span>
              )}
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
                  <SizeSelector
                    sizes={variantOptions?.sizes}
                    selectedSize={selectedSize}
                    selectedColor={selectedColor}
                    getAvailableSizes={getAvailableSizes}
                    onSizeSelect={handleSizeSelect}
                  />
                </div>

                {variantOptions && variantOptions.colors && (
                  <div>
                    <h3 className='text-xs text-[#757575] sm:text-sm'>Màu sắc: {selectedColor}</h3>
                    <ColorSelector
                      colors={variantOptions?.colors}
                      selectedColor={selectedColor}
                      selectedSize={selectedSize}
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

            {isAdmin ? (
              <></>
            ) : (
              <div className='m-2 flex flex-col gap-3 sm:m-4 sm:gap-4 lg:flex-row'>
                <Button variant='secondary' onClick={handleAddToCart} className='xs:flex-1 w-full'>
                  <ShoppingCart strokeWidth={1} className='mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5' />
                  <span className='text-sm'>Thêm vào giỏ hàng</span>
                </Button>
                <Button variant='primary' onClick={handleBuyNow} className='xs:flex-1 w-full'>
                  <span className='text-sm'>Mua ngay với giá {price || 0}</span>
                </Button>
              </div>
            )}
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
