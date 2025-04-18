import Button from '@/components/common/Button/Button';
import { addToCart } from '@/redux/features/cart/cartSlice';
import React, { useMemo, useState } from 'react';
import { ShoppingCart, Heart, ZoomIn, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function ProductCard({ item, isSearchMobile = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Tính toán available options
  const variantOptions = useMemo(() => {
    const sizeMap = new Map();
    const colorMap = new Map();

    item.variants.forEach((variant) => {
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
  }, [item.variants]);

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
      return;
    }

    setSelectedSize(size);
    // Kiểm tra nếu color hiện tại không có trong size mới thì reset color
    if (!variantOptions.sizeMap.get(size)?.has(selectedColor)) {
      setSelectedColor('');
    }
  };

  const handleColorSelect = (color) => {
    // Nếu click vào color đang được chọn thì bỏ chọn
    if (selectedColor === color) {
      setSelectedColor('');
      return;
    }

    setSelectedColor(color);
    // Kiểm tra nếu size hiện tại không có trong color mới thì reset size
    if (!variantOptions.colorMap.get(color)?.has(selectedSize)) {
      setSelectedSize('');
    }
  };

  // Hàm lấy giá dựa trên size và color được chọn
  const getSelectedPrice = () => {
    if (selectedSize && selectedColor) {
      const selectedVariant = item.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      if (selectedVariant) {
        return {
          price: selectedVariant.price,
          discountPrice: selectedVariant.discountPrice
        };
      }
    }
    // Giá mặc định (giá thấp nhất)
    const defaultVariant = item.variants.reduce((min, variant) => (!min || variant.price < min.price ? variant : min));
    return {
      price: defaultVariant.price,
      discountPrice: defaultVariant.discountPrice
    };
  };

  // Hàm xử lý sự kiện khi nhấn nút "Thêm vào giỏ hàng"
  const handleAddToCart = () => {
    const selectedVariant = item.variants.find((v) => v.size === selectedSize && v.color === selectedColor);

    if (!selectedVariant) {
      alert('Vui lòng chọn size và màu sắc');
      return;
    }

    const cartItem = {
      productId: item._id,
      variantId: selectedVariant._id,
      quantity: 1,
      snapshot: {
        name: item.name,
        price: selectedVariant.price,
        discountPrice: selectedVariant.discountPrice,
        color: selectedVariant.color,
        size: selectedVariant.size,
        image: item.images[0]
      }
    };
    dispatch(addToCart(cartItem));
    // dispatch(addToCart(product));
  };

  // Hàm xử lý sự kiện khi nhấn nút "Mua ngay"
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  // Hàm navigate đến trang chi tiết sản phẩm
  const handleNavigateToDetail = () => {
    navigate(`/product/${item._id}`);
  };

  return (
    <div className='flex h-full w-full flex-col items-start justify-start overflow-hidden rounded border-2'>
      <div className='group relative max-h-[340px] w-full cursor-pointer'>
        <img className='max-h-[340px] w-full object-cover' src={item?.images[0]} alt={item?.name} />
        <img
          className='absolute bottom-0 left-0 right-0 top-0 max-h-[340px] w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-300'
          src={item?.images[1]}
          alt={`${item?.name} - Alternate view`}
        />

        <div className='absolute right-3 top-3 flex flex-col gap-2 bg-transparent transition-all duration-300 group-hover:right-3 group-hover:opacity-100 group-hover:transition-all group-hover:duration-300 lg:right-0 lg:opacity-0'>
          <button className='flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 bg-white text-base hover:bg-[#D9D9D9] sm:h-[40px] sm:w-[40px] sm:text-xl'>
            <Heart strokeWidth={1.5} width={20} />
          </button>
          <button className='flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 bg-white text-base hover:bg-[#D9D9D9] sm:h-[40px] sm:w-[40px] sm:text-2xl'>
            <ZoomIn strokeWidth={1.5} width={20} />
          </button>
        </div>
      </div>
      <div
        className={`flex h-full w-full flex-col items-start justify-between gap-[10px] p-3 sm:p-5 ${isSearchMobile && '!p-1'}`}
      >
        <div>
          <div className='cursor-pointer text-xs text-primaryColor sm:text-base' onClick={handleNavigateToDetail}>
            {item?.name}
          </div>
          {/* Hiển thị giá */}
          <div className='my-1 text-[10px] font-normal text-secondaryColor sm:my-2 sm:text-sm'>
            {(() => {
              const { price, discountPrice } = getSelectedPrice();
              return (
                <>
                  <span className='font-medium'>${price.toLocaleString()}</span>
                  {discountPrice && (
                    <span className='ml-2 text-gray-400 line-through'>${discountPrice.toLocaleString()}</span>
                  )}
                  {!selectedSize && !selectedColor && (
                    <span className='ml-1 text-[9px] text-gray-500 sm:text-xs'>(Giá từ)</span>
                  )}
                </>
              );
            })()}
          </div>
          {/* Size Selection */}
          <div className='mb-2'>
            <div className='text-[10px] font-semibold text-gray-600 sm:text-xs'>Size:</div>
            <div className='mt-1 flex flex-wrap gap-1'>
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
                    className={`h-6 min-w-[2rem] rounded border px-2 text-[10px] sm:text-xs ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
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

          {/* Color Selection */}
          <div className='mb-2'>
            <div className='text-[10px] font-semibold text-gray-600 sm:text-xs'>Màu sắc:</div>
            <div className='mt-1 flex flex-wrap gap-1'>
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
                    className={`h-6 min-w-[2rem] rounded border px-2 text-[10px] sm:text-xs ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : isAvailable
                          ? 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                          : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating section */}
          <div className='mt-1 flex items-center gap-1'>
            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4' />
            <span className='text-[10px] text-gray-600 sm:text-xs'>
              {item.averageRating.toFixed(1)} ({item.totalReviews} đánh giá)
            </span>
          </div>
        </div>

        {/* Buttons */}
        {!isSearchMobile && (
          <div className='w-full'>
            <div className='flex w-full items-center justify-between gap-2'>
              <Button fullWidth onClick={handleBuyNow} disabled={!selectedSize || !selectedColor}>
                Mua ngay
              </Button>
              <Button
                variant='secondary'
                onClick={handleAddToCart}
                startIcon={<ShoppingCart strokeWidth={1.5} width={20} />}
                disabled={!selectedSize || !selectedColor}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
