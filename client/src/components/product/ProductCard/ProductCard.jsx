import Button from '@/components/common/Button/Button';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function ProductCard({ item, isSearchMobile = false, isShowVariant = true }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Tính toán available options
  const variantOptions = useMemo(() => {
    const colorMap = new Map();
    const imageMap = new Map();

    item.variants.forEach((variant) => {
      // Map color to images
      if (!colorMap.has(variant.color)) {
        colorMap.set(variant.color, new Set());
      }
      colorMap.get(variant.color).add(variant.size);

      // Map image to colors
      if (!imageMap.has(variant.images[0])) {
        imageMap.set(variant?.images[0], new Set());
      }
      imageMap.get(variant?.images[0]).add(variant.size);
    });

    return {
      images: Array.from(imageMap.keys()),
      colors: Array.from(colorMap.keys()),
      imageMap,
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
    if (selectedImage === size) {
      setSelectedImage('');
      return;
    }

    setSelectedImage(size);
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
    // Kiểm tra nếu image hiện tại không có trong color mới thì reset image
    if (!variantOptions.colorMap.get(color)?.has(selectedImage)) {
      setSelectedImage('');
    }
  };

  // Hàm lấy giá dựa trên size và color được chọn
  const getSelectedPrice = () => {
    if (selectedImage && selectedColor) {
      const selectedVariant = item.variants.find((v) => v.size === selectedImage && v.color === selectedColor);
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
    const selectedVariant = item.variants.find((v) => v.size === selectedImage && v.color === selectedColor);

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
    console.log('click');
    setIsOpenShopNow(true);
  };

  // Hàm navigate đến trang chi tiết sản phẩm
  const handleNavigateToDetail = () => {
    navigate(`/product/${item._id}`);
  };

  return (
    <div className='flex h-full w-full flex-col items-start justify-start overflow-hidden border'>
      <div className='group relative max-h-[340px] w-full cursor-pointer'>
        <img className='max-h-[340px] w-full object-cover' src={item?.images[0]} alt={item?.name} />
        <img
          className='absolute bottom-0 left-0 right-0 top-0 max-h-[340px] w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-300'
          src={item?.images[1]}
        />

        <div className='absolute right-3 top-3 flex flex-col gap-2 bg-transparent transition-all duration-300 group-hover:right-3 group-hover:opacity-100 group-hover:transition-all group-hover:duration-300 lg:right-0 lg:opacity-0'>
          <button className='flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 bg-white hover:bg-primaryColor hover:text-white'>
            <Heart strokeWidth={1.5} width={20} />
          </button>
          {/* <button className='flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 bg-white hover:bg-primaryColor hover:text-white'>
              <Eye strokeWidth={1.5} width={20} />
            </button> */}
        </div>
      </div>
      <div
        className={`flex h-full w-full flex-col items-start justify-between p-2 sm:px-3 ${isSearchMobile && '!p-1'}`}
      >
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
                {color === 'Đỏ' && <div className='h-full w-full rounded-full border bg-red-500'></div>}
                {color === 'Xanh' && <div className='h-full w-full rounded-full border bg-blue-500'></div>}
                {color === 'Vàng' && <div className='h-full w-full rounded-full border bg-yellow-500'></div>}
                {color === 'Trắng' && <div className='h-full w-full rounded-full border bg-white'></div>}
                {color === 'Đen' && <div className='h-full w-full rounded-full border bg-black'></div>}
                {color === 'Xám' && <div className='h-full w-full rounded-full border bg-gray-500'></div>}
                {color === 'Xanh lá' && <div className='h-full w-full rounded-full border bg-green-500'></div>}
                {color === 'Hồng' && <div className='h-full w-full rounded-full border bg-pink-500'></div>}
                {color === 'Tím' && <div className='h-full w-full rounded-full border bg-purple-500'></div>}
                {color === 'Cam' && <div className='h-full w-full rounded-full border bg-orange-500'></div>}
                {color === 'Nâu' && <div className='h-full w-full rounded-full border bg-amber-950'></div>}
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
              {item.averageRating.toFixed(1)} ({item.totalReviews})
            </span>
          </div>
        </div>
      </div>
      {/* Buttons */}
      {!isSearchMobile && (
        <div className='grid w-full grid-cols-2 items-center justify-between'>
          <Button onClick={handleBuyNow}>
            <ShoppingCart strokeWidth={1} width={16} height={16} className='mr-1' />
            Mua ngay
          </Button>
          <Button variant='secondary' onClick={handleNavigateToDetail}>
            <Eye strokeWidth={1} width={16} height={16} className='mr-1' />
            Xem chi tiết
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
