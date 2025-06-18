import Button from '@/components/common/Button/Button';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import { COLOR_OPTIONS, SIZE_OPTIONS, PRICE_RANGES } from '@/utils/constants';
import { CloseOutlined, StarFilled } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export function FilterSidebar({ isFilterOpen, setIsFilterOpen, onFilterChange, onResetFilter, params }) {
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');

  const rating = params?.get('rating') || '';
  const minPrice = params?.get('minPrice') || '';
  const maxPrice = params?.get('maxPrice') || '';
  const sizes = params?.get('size')?.split(',').filter(Boolean) || [];
  const colors = params?.get('color')?.split(',').filter(Boolean) || [];

  let filterCounter = 0;
  const caculateFilterCounter = () => {
    if (minPrice || maxPrice) filterCounter++;
    if (sizes?.length > 0) filterCounter++;
    if (colors?.length > 0) filterCounter++;
    if (rating) filterCounter++;
    return filterCounter > 0 ? `(${filterCounter})` : '';
  };

  // Kiểm tra xem có đang sử dụng khoảng giá tùy chỉnh không
  const currentPriceRange = PRICE_RANGES.find(
    (range) => range.min.toString() === minPrice && (range.max ? range.max.toString() === maxPrice : !maxPrice)
  );

  const handlePriceRangeChange = (priceRange) => {
    if (currentPriceRange?.label === priceRange.label) {
      // Nếu đang chọn range này thì bỏ chọn
      onFilterChange('priceRange', null);
    } else {
      // Chọn range mới
      onFilterChange('priceRange', priceRange);
      setShowCustomPrice(false);
    }
  };
  const handleCustomPriceChange = (type, value) => {
    if (type === 'minPrice') {
      setTempMinPrice(value);
    } else if (type === 'maxPrice') {
      setTempMaxPrice(value);
    }
  };
  const handleApplyCustomPrice = () => {
    if (tempMinPrice) {
      onFilterChange('minPrice', tempMinPrice);
    }
    if (tempMaxPrice) {
      onFilterChange('maxPrice', tempMaxPrice);
    }
    if (!tempMinPrice && !tempMaxPrice) {
      // Nếu cả 2 đều trống thì xóa filter giá
      onFilterChange('priceRange', null);
    }
  };
  // Khởi tạo giá tùy chỉnh khi có giá từ URL params
  useEffect(() => {
    if (minPrice && !currentPriceRange) {
      setTempMinPrice(minPrice);
      setShowCustomPrice(true);
    }
    if (maxPrice && !currentPriceRange) {
      setTempMaxPrice(maxPrice);
      setShowCustomPrice(true);
    }
  }, [minPrice, maxPrice, currentPriceRange]);

  const handleShowCustomPrice = () => {
    if (showCustomPrice) {
      setShowCustomPrice(false);
      setTempMinPrice('');
      setTempMaxPrice('');
      onFilterChange('priceRange', null);
    } else {
      setShowCustomPrice(true);
    }

    // Reset khoảng giá định sẵn nếu có
    if (currentPriceRange) {
      onFilterChange('priceRange', null);
    }
  };

  const handleToggleColor = (color) => {
    onFilterChange('color', color);
  };

  const handleToggleSize = (size) => {
    onFilterChange('size', size);
  };

  const handleRatingChange = (ratingValue) => {
    if (rating === ratingValue.toString()) {
      // Nếu đang chọn rating này thì bỏ chọn
      onFilterChange('rating', '');
    } else {
      onFilterChange('rating', ratingValue.toString());
    }
  };

  const handleClearFilter = (filterType) => {
    switch (filterType) {
      case 'price':
        onFilterChange('priceRange', null);
        break;
      case 'color':
        colors.forEach((color) => onFilterChange('color', color));
        break;
      case 'size':
        sizes.forEach((size) => onFilterChange('size', size));
        break;
      case 'rating':
        onFilterChange('rating', '');
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`rounded-md bg-white p-5 ${
        // Ẩn/hiện trên mobile
        isFilterOpen ? 'block' : 'hidden lg:block'
      }`}
    >
      {/* Mobile close button */}
      <div className='mb-4 flex items-center justify-between lg:hidden'>
        <h2 className='text-lg font-semibold'>Bộ lọc</h2>
        <button className='rounded-full p-1 hover:bg-gray-100' onClick={() => setIsFilterOpen(false)}>
          <CloseOutlined />
        </button>
      </div>
      {/* Filter title - desktop */}
      <div className='mb-4 hidden items-center justify-between lg:flex'>
        <h2 className='flex items-center text-lg font-semibold'>Bộ lọc sản phẩm {caculateFilterCounter()} </h2>
        {filterCounter > 0 && (
          <button onClick={onResetFilter} className='rounded-sm px-2 py-1 text-sm text-gray-600 hover:bg-neutral-100'>
            Xóa
          </button>
        )}
      </div>
      {/* Price range */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Khoảng giá</h3>
          {(minPrice || maxPrice) && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => handleClearFilter('price')}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        {/* Các mức giá định sẵn */}
        <div className='mb-4 flex flex-col gap-2'>
          {PRICE_RANGES.map((priceRange, index) => (
            <button
              key={index}
              onClick={() => handlePriceRangeChange(priceRange)}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                currentPriceRange?.label === priceRange.label
                  ? 'border-primaryColor bg-primaryColor/10 text-primaryColor'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primaryColor hover:bg-gray-50'
              }`}
            >
              <span>{priceRange.label}</span>
              {currentPriceRange?.label === priceRange.label && <span className='text-primaryColor'>✓</span>}
            </button>
          ))}

          {/* Tùy chỉnh giá */}
          <button
            onClick={handleShowCustomPrice}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
              showCustomPrice || (!currentPriceRange && (minPrice || maxPrice))
                ? 'border-primaryColor bg-primaryColor/10 text-primaryColor'
                : 'border-gray-300 bg-white text-gray-700 hover:border-primaryColor hover:bg-gray-50'
            }`}
          >
            <span>Tùy chỉnh</span>
            {(showCustomPrice || (!currentPriceRange && (minPrice || maxPrice))) && (
              <span className='text-primaryColor'>✓</span>
            )}
          </button>
        </div>
        {/* Input tùy chỉnh giá */}
        {(showCustomPrice || (!currentPriceRange && (minPrice || maxPrice))) && (
          <div className='flex flex-col items-start space-y-3'>
            <div className='flex items-center gap-2'>
              <InputNumber
                type='number'
                suffix={'đ'}
                value={tempMinPrice}
                onChange={(e) => handleCustomPriceChange('minPrice', e.target.value)}
                placeholder='Từ'
                min='0'
              />
              <span className='text-gray-500'>-</span>
              <InputNumber
                type='number'
                suffix={'đ'}
                value={tempMaxPrice}
                onChange={(e) => handleCustomPriceChange('maxPrice', e.target.value)}
                placeholder='Đến'
                min='0'
              />
            </div>
            {tempMinPrice && tempMaxPrice && parseInt(tempMinPrice) > parseInt(tempMaxPrice) && (
              <p className='text-xs text-red-500'>Giá thấp nhất không được lớn hơn giá cao nhất</p>
            )}
            <button
              onClick={handleApplyCustomPrice}
              disabled={tempMinPrice && tempMaxPrice && parseInt(tempMinPrice) > parseInt(tempMaxPrice)}
              className='rounded-md bg-primaryColor px-4 py-2 text-sm text-white transition hover:bg-primaryColor/90 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>
      {/* Colors */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Màu sắc</h3>
          {colors && colors.length > 0 && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => handleClearFilter('color')}
            >
              Bỏ chọn ({colors.length})
            </button>
          )}
        </div>
        <div className='flex flex-wrap gap-3'>
          {COLOR_OPTIONS.map((color, index) => (
            <div key={index} className='group relative'>
              <button
                onClick={() => handleToggleColor(color.name)}
                className={`h-6 w-6 transform rounded-full border transition hover:scale-125 ${
                  colors.includes(color.name) ? 'scale-125 border-[#333] ring-2 ring-primaryColor' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <div className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                {color.name}
              </div>
              {colors.includes(color.name) && (
                <div className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primaryColor text-xs text-white'>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>{' '}
      {/* Sizes */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Kích thước</h3>
          {sizes && sizes.length > 0 && (
            <button className='text-xs text-gray-600 hover:text-primaryColor' onClick={() => handleClearFilter('size')}>
              Bỏ chọn ({sizes.length})
            </button>
          )}
        </div>
        <div className='flex flex-wrap gap-2'>
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size.value}
              onClick={() => handleToggleSize(size.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-sm border text-xs transition ${
                sizes.includes(size.value)
                  ? 'border-primaryColor bg-primaryColor font-medium text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primaryColor hover:bg-gray-50'
              }`}
              aria-pressed={sizes.includes(size.value)}
            >
              {size.name}
            </button>
          ))}
        </div>
      </div>{' '}
      {/* Rating */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Đánh giá</h3>
          {rating > 0 && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => handleClearFilter('rating')}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex gap-2'>
          {/* {[5, 4, 3, 2, 1].map((starCount) => (
            <button
              key={starCount}
              onClick={() => handleRatingChange(starCount)}
              className={`flex items-center gap-2 rounded-md p-2 transition ${
                rating === starCount.toString() ? 'border border-primaryColor bg-primaryColor/10' : 'hover:bg-gray-50'
              }`}
            >
              <div className='flex'>
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarFilled
                    key={index}
                    className={`text-sm ${index < starCount ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className='text-sm text-gray-600'>
                {starCount} sao {starCount === 5 ? 'trở lên' : ''}
              </span>
            </button>
          ))} */}
          {Array.from({ length: 5 }).map((_, index) => (
            <button
              key={index}
              className={`cursor-pointer ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => handleRatingChange(index + 1)}
            >
              <StarFilled />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

FilterSidebar.propTypes = {
  isFilterOpen: PropTypes.bool,
  setIsFilterOpen: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilter: PropTypes.func.isRequired,
  params: PropTypes.shape({
    get: PropTypes.func.isRequired
  }).isRequired
};
