import Button from '@/components/common/Button/Button';
import { colorOptions } from '@/constants/colors';
import { addToCart } from '@/store/slices/cartSlice';
import { openProductDetailModal } from '@/store/slices/productSlice';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function ProductCard({ item, isShowVariant = true }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [displayImage, setDisplayImage] = useState(item?.images[0]);
  const [hoverImage, setHoverImage] = useState(item?.images[1] || item?.images[0]);

  // Tính toán available options
  const variantOptions = useMemo(() => {
    const colorMap = new Map();
    const sizeMap = new Map();
    const colorImageMap = new Map(); // Map để lưu trữ màu sắc và hình ảnh tương ứng

    item.variants.forEach((variant) => {
      // Map color to images
      if (!colorMap.has(variant.color)) {
        colorMap.set(variant.color, new Set());
        // Lưu trữ hình ảnh đầu tiên của mỗi màu
        if (variant.images && variant.images.length > 0) {
          colorImageMap.set(variant.color, variant.images);
        }
      }
      colorMap.get(variant.color).add(variant.size);

      // Map image to colors
      if (!sizeMap.has(variant.images[0])) {
        sizeMap.set(variant?.images[0], new Set());
      }
      sizeMap.get(variant?.images[0]).add(variant.size);
    });

    return {
      images: Array.from(sizeMap.keys()),
      colors: Array.from(colorMap.keys()),
      sizeMap,
      colorMap,
      colorImageMap // Thêm colorImageMap vào kết quả
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
      // Reset lại hình ảnh mặc định khi bỏ chọn màu
      setDisplayImage(item?.images[0]);
      setHoverImage(item?.images[1] || item?.images[0]);
      return;
    }

    setSelectedColor(color);

    // Cập nhật hình ảnh dựa trên màu sắc được chọn
    const colorImages = variantOptions.colorImageMap.get(color);
    if (colorImages && colorImages.length > 0) {
      setDisplayImage(colorImages[0]);
      setHoverImage(colorImages[1] || colorImages[0]);
    }

    // Kiểm tra nếu image hiện tại không có trong color mới thì reset image
    if (!variantOptions.colorMap.get(color)?.has(selectedSize)) {
      setSelectedSize('');
    }
  };

  // Hàm lấy giá dựa trên size và color được chọn
  const getSelectedPrice = () => {
    if (selectedSize && selectedColor) {
      const selectedVariant = item?.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      if (selectedVariant) {
        return {
          price: selectedVariant.price,
          discountPrice: selectedVariant.discountPrice
        };
      }
    }
    // Giá mặc định (giá thấp nhất)
    // Check if variants array exists and is not empty
    if (!item?.variants || item.variants.length === 0) {
      return {
        price: 0,
        discountPrice: null
      };
    }

    const defaultVariant = item.variants.reduce(
      (min, variant) => (!min || variant.price < min.price ? variant : min),
      null
    );

    return {
      price: defaultVariant?.price || 0,
      discountPrice: defaultVariant?.discountPrice
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
    // Open the product detail modal with this product's data
    dispatch(openProductDetailModal(item._id));
  };

  // Hàm navigate đến trang chi tiết sản phẩm
  const handleNavigateToDetail = () => {
    navigate(`/product/${item._id}`);
  };

  return (
    <div className='flex h-full w-full flex-col items-start justify-start overflow-hidden rounded-sm border bg-white hover:opacity-95 hover:shadow-xl'>
      <div className='group relative max-h-[340px] w-full cursor-pointer'>
        <img className='max-h-[340px] w-full object-cover' src={displayImage} alt={item?.name} />
        <img
          className='absolute bottom-0 left-0 right-0 top-0 max-h-[340px] w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-300'
          src={hoverImage}
        />

        <div className='absolute right-3 top-3 flex flex-col gap-2 bg-transparent transition-all duration-300 group-hover:right-3 group-hover:opacity-100 group-hover:transition-all group-hover:duration-300 lg:right-0 lg:opacity-0'>
          <button className='flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 bg-white hover:bg-primaryColor hover:text-white'>
            <Heart strokeWidth={1.5} width={20} />
          </button>
        </div>
      </div>
      <div className={`flex h-full w-full flex-col items-start justify-between p-2 sm:px-3`}>
        {/* Color Selection */}
        <div className='flex w-full justify-center gap-1'>
          {variantOptions.colors.map((color) => {
            return (
              <button
                key={color}
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorSelect(color);
                }}
                className={`h-[25px] w-[25px] rounded-full border p-[2px] text-[10px] sm:text-xs ${
                  selectedColor === color && 'border-black text-black'
                }`}
              >
                {colorOptions.map(
                  (option) =>
                    option.name === color && (
                      <div
                        key={option.name}
                        className='h-full w-full rounded-full border'
                        style={{ backgroundColor: option.hex }}
                      ></div>
                    )
                )}
              </button>
            );
          })}
        </div>
        <div className='mt-1 w-full cursor-pointer text-sm text-primaryColor' onClick={handleNavigateToDetail}>
          {item?.name}
        </div>
        <div className='flex w-full justify-between'>
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
                </>
              );
            })()}
          </div>

          {/* Rating section */}
          <div className='mt-1 flex items-center gap-1'>
            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4' />
            <span className='text-[10px] text-gray-600 sm:text-xs'>
              {item?.averageRating?.toFixed(1) || '0.0'} ({item?.totalReviews || 0})
            </span>
          </div>
        </div>
      </div>
      {/* Buttons */}
      <div className='grid w-full grid-cols-2 items-center justify-between gap-1'>
        <Button onClick={handleBuyNow} className='transition-all duration-200 active:scale-[0.98]'>
          <ShoppingCart strokeWidth={1} width={16} height={16} className='mr-1' />
          <span className='hidden lg:inline'>Mua nhanh</span>
          <span className='lg:hidden'>Mua</span>
        </Button>
        <Button variant='secondary' onClick={handleNavigateToDetail}>
          <Eye strokeWidth={1} width={15} height={15} className='mr-1' />
          <span className='hidden lg:inline'>Chi tiết</span>
          <span className='lg:hidden'>Xem</span>
        </Button>
      </div>
    </div>
  );
}

export default ProductCard;
