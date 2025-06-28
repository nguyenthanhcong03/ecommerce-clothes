import Button from '@/components/common/Button/Button';
import useProductVariants from '@/hooks/useProductVariants';
import { openProductDetailModal } from '@/store/slices/productSlice';
import { closeSearchModal } from '@/store/slices/searchSlice';
import { COLOR_OPTIONS } from '@/utils/constants';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { generateNameId } from '@/utils/helpers/fn';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function ProductCard({ item, isShowVariant = true, isShowButton = true, isShowActionButtons = true }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { variantOptions, getSelectedPrice } = useProductVariants(item);

  // Hàm xử lý sự kiện khi nhấn nút "Mua ngay"
  const handleBuyNow = () => {
    dispatch(openProductDetailModal(item._id));
  };

  // Hàm navigate đến trang chi tiết sản phẩm
  const handleNavigateToDetail = () => {
    navigate(`/product/${generateNameId({ name: item.name, id: item._id })}`);
    dispatch(closeSearchModal());
  };

  return (
    <div className='flex h-full w-full flex-col items-start justify-start overflow-hidden rounded-sm border bg-white hover:opacity-95 hover:shadow-xl'>
      <div className='group relative max-h-[340px] w-full cursor-pointer'>
        <div onClick={handleNavigateToDetail}>
          <img className='max-h-[340px] w-full object-cover' src={item?.images[0]} alt={item?.name} />
          <img
            className='absolute bottom-0 left-0 right-0 top-0 max-h-[340px] w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-300'
            src={item?.images[1] || item?.images[0]}
          />
        </div>

        {isShowActionButtons && (
          <div className='absolute right-3 top-3 flex flex-col gap-2 bg-transparent transition-all duration-300 group-hover:right-3 group-hover:opacity-100 group-hover:transition-all group-hover:duration-300 lg:right-0 lg:opacity-0'>
            <button className='flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 bg-white hover:bg-primaryColor hover:text-white'>
              <Heart strokeWidth={1.5} width={20} />
            </button>
          </div>
        )}
      </div>
      <div className={`flex h-full w-full flex-col items-start justify-between p-2 sm:px-3`}>
        {/* Color Selection */}
        {isShowVariant && (
          <div className='flex w-full justify-center gap-1'>
            {variantOptions.colors.map((color) => {
              return (
                <button key={color} className='h-[25px] w-[25px] rounded-full border p-[2px] text-[10px] sm:text-xs'>
                  {COLOR_OPTIONS.map(
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
        )}
        <div className='mt-1 w-full cursor-pointer text-sm text-primaryColor' onClick={handleNavigateToDetail}>
          {item?.name}
        </div>
        <div className='flex w-full justify-between'>
          {/* Hiển thị giá */}
          <div className='my-1 text-[10px] font-normal text-secondaryColor sm:my-2 sm:text-sm'>
            {(() => {
              const { price, originalPrice } = getSelectedPrice();
              return (
                <>
                  <span className='font-medium'>{formatCurrency(price || 0)}</span>
                  {originalPrice && (
                    <span className='ml-2 text-gray-400 line-through'>{formatCurrency(originalPrice || 0)}</span>
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

      {/* Button  */}
      {isShowButton && (
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
      )}
    </div>
  );
}

export default ProductCard;
