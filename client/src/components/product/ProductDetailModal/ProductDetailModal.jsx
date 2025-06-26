import Button from '@/components/common/Button/Button';
import QuantityInput from '@/components/common/QuantityInput/QuantityInput';
import ColorSelector from '@/components/product/ColorSelector/ColorSelector';
import ShareButtons from '@/components/product/ShareButtons/ShareButtons';
import SizeSelector from '@/components/product/SizeSelector/SizeSelector';
import useProductVariants from '@/hooks/useProductVariants';
import { addToCart } from '@/store/slices/cartSlice';
import { setOrderItems } from '@/store/slices/orderSlice';
import { closeProductDetailModal, fetchProductById } from '@/store/slices/productSlice';
import { message } from 'antd';
import { Heart, ShoppingCart, Star, X } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProductDetailModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.account);
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const {
    isDetailModalOpen,
    modalProductId,
    currentProduct: product,
    loadingFetchProductById
  } = useSelector((state) => state.product);

  useEffect(() => {
    if (isDetailModalOpen && modalProductId) {
      dispatch(fetchProductById(modalProductId));
    }
  }, [dispatch, isDetailModalOpen, modalProductId]);

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
    variantOptions,
    isProductOutOfStock,
    isSizeOutOfStock,
    isColorOutOfStock,
    isVariantOutOfStock,
    getAvailableColors,
    getAvailableSizes,
    handleSizeSelect,
    handleColorSelect,
    getSelectedPrice
  } = useProductVariants(product);

  const { price, originalPrice, stock } = getSelectedPrice();

  useEffect(() => {
    if (isDetailModalOpen) {
      setQuantity(1);
      setCurrentImageIndex(0);
      setShowValidation(false);
    }
  }, [isDetailModalOpen, setQuantity, setCurrentImageIndex, setShowValidation]);

  const handleCloseModal = () => {
    dispatch(closeProductDetailModal());
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      setShowValidation(true);
      return;
    }

    if (!isAuthenticated) {
      message.error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      handleCloseModal();
      navigate('/login');
      return;
    }
    try {
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
    handleCloseModal();
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      message.error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      handleCloseModal();
      navigate('/login');
      return;
    }
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
          originalPrice: selectedVariant.originalPrice,
          color: selectedVariant.color,
          size: selectedVariant.size,
          image: product.images[0]
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

        {loadingFetchProductById ? (
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
            <div className='w-full p-3'>
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

            {/* Right Column - Product Info */}
            <div>
              <div>
                <h1 className='text-xl font-medium'>{product.name}</h1>
                <div className='mt-2 flex items-center gap-2'>
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='ml-1 text-sm text-gray-600'>
                      {product.averageRating} ({product.totalReviews} đánh giá) | {product.salesCount} lượt bán
                    </span>
                  </div>
                </div>
              </div>

              <div className='my-4 flex items-center gap-4 bg-[#F9F9F9] p-3'>
                <span className='text-md font-medium sm:text-3xl'>
                  {price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  })}
                </span>
                {originalPrice && originalPrice !== 0 && (
                  <span className='ml-1 text-sm text-gray-400 line-through sm:ml-2 sm:text-lg'>
                    {originalPrice.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    })}
                  </span>
                )}
                {isProductOutOfStock && (
                  <span className='ml-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 sm:text-sm'>
                    Hết hàng
                  </span>
                )}
              </div>

              {/* Size và color */}
              <div
                className={`flex flex-col gap-4 p-3 ${showValidation && (!selectedSize || !selectedColor) ? 'rounded bg-red-50' : ''}`}
              >
                <div>
                  <h3 className='text-sm font-medium'>Size</h3>
                  <SizeSelector
                    sizes={variantOptions?.sizes}
                    selectedSize={selectedSize}
                    selectedColor={selectedColor}
                    getAvailableSizes={getAvailableSizes}
                    onSizeSelect={handleSizeSelect}
                    isSizeOutOfStock={isSizeOutOfStock}
                  />
                </div>

                <div>
                  <h3 className='text-sm font-medium'>Màu sắc</h3>
                  <ColorSelector
                    colors={variantOptions?.colors}
                    selectedColor={selectedColor}
                    selectedSize={selectedSize}
                    getAvailableColors={getAvailableColors}
                    onColorSelect={handleColorSelect}
                    isColorOutOfStock={isColorOutOfStock}
                  />
                </div>

                <div>
                  <h3 className='text-sm font-medium'>Số lượng</h3>
                  <div className='mt-2 flex items-center space-x-2'>
                    <QuantityInput
                      value={quantity}
                      min={1}
                      max={stock}
                      onChange={(newQuantity) => handleQuantityChange(newQuantity)}
                      disabled={isProductOutOfStock || !selectedColor || !selectedSize}
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

              {isAdmin ? (
                <></>
              ) : (
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
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailModal;
