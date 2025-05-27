import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input';
import InputNumber from '@/components/common/InputNumber/InputNumber';
import useDebounce from '@/hooks/useDebounce';
import { COLOR_OPTIONS, SIZE_OPTIONS } from '@/utils/constants';
import { CloseOutlined, FilterOutlined, StarFilled } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { NumberFormatBase } from 'react-number-format';

export function FilterSidebar({
  isFilterOpen,
  setIsFilterOpen,
  filters,
  onFilterChange,
  onResetFilter,
  onApplyFilter
}) {
  const handlePriceChange = (value, type) => {
    console.log('type', type, value);
    onFilterChange({ ...filters, [type]: value });
  };

  const handleToggleColor = (color) => {
    const newColors = filters.color.includes(color)
      ? filters.color.filter((c) => c !== color)
      : [...filters.color, color];
    onFilterChange({ ...filters, color: newColors });
  };

  const handleToggleSize = (size) => {
    const newSizes = filters.size.includes(size) ? filters.size.filter((s) => s !== size) : [...filters.size, size];
    onFilterChange({ ...filters, size: newSizes });
  };

  const handleRatingChange = (rating) => {
    const newRating = filters.rating === rating ? 0 : rating;
    onFilterChange({ ...filters, rating: newRating });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <button
        key={index}
        className={`cursor-pointer ${index < filters.rating ? 'text-yellow-400' : 'text-gray-300'}`}
        onClick={() => handleRatingChange(index + 1)}
      >
        <StarFilled />
      </button>
    ));
  };

  return (
    <div className='rounded-md bg-white p-5'>
      {/* Mobile close button */}
      <div className='mb-4 flex items-center justify-between lg:hidden'>
        <h2 className='text-lg font-semibold'>Bộ lọc</h2>
        <button className='rounded-full p-1 hover:bg-gray-100' onClick={() => setIsFilterOpen(false)}>
          <CloseOutlined />
        </button>
      </div>

      {/* Filter title - desktop */}
      <div className='mb-4 hidden lg:block'>
        <h2 className='text-lg font-semibold'>Bộ lọc sản phẩm</h2>
      </div>

      {/* Price range */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Khoảng giá</h3>
          {(filters.minPrice || filters.maxPrice) && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => {
                onFilterChange({ ...filters, minPrice: '', maxPrice: '' });
              }}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex flex-col items-start'>
          <div className='flex items-center gap-2'>
            <InputNumber
              type='number'
              suffix={'đ'}
              value={filters.minPrice}
              onChange={(e) => handlePriceChange(e.target.value, 'minPrice')}
              placeholder='Từ'
              min='0'
            />

            <span className='text-gray-500'>-</span>
            <InputNumber
              type='number'
              suffix={'đ'}
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange(e.target.value, 'maxPrice')}
              placeholder='Đến'
              min='0'
            />
          </div>
          {filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice && (
            <p className='mt-1 text-xs text-red-500'>Giá thấp nhất không được lớn hơn giá cao nhất</p>
          )}
        </div>
      </div>

      {/* Colors */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Màu sắc</h3>
          {filters.color.length > 0 && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => {
                onFilterChange({ ...filters, color: [] });
              }}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex flex-wrap gap-3'>
          {COLOR_OPTIONS.map((color, index) => (
            <div key={index} className='group relative'>
              <button
                onClick={() => handleToggleColor(color.name)}
                className={`h-6 w-6 transform rounded-full border transition hover:scale-125 ${
                  filters.color.includes(color.name) ? 'scale-125 border-[#333]' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
                aria-pressed={filters.color.includes(color.name)}
              />
              <div className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                {color.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Kích thước</h3>
          {filters.size.length > 0 && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => {
                onFilterChange({ ...filters, size: [] });
              }}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex flex-wrap gap-2'>
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size.value}
              onClick={() => handleToggleSize(size.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-sm border text-xs transition ${
                filters.size.includes(size.value)
                  ? 'border-[#333] font-medium'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={filters.size.includes(size.value)}
            >
              {size.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Đánh giá</h3>
          {filters.rating > 0 && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => {
                onFilterChange({ ...filters, rating: '' });
              }}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex items-center text-xl'>{renderStars()}</div>
      </div>

      {/* Filter actions */}
      <div className='mt-6 grid grid-cols-2 gap-4'>
        <Button onClick={onResetFilter} variant='secondary' aria-label='Đặt lại tất cả bộ lọc'>
          <CloseOutlined className='mr-1' /> Xóa tất cả
        </Button>
        <Button
          onClick={onApplyFilter}
          className='hover:bg-primary-700 flex flex-1 items-center justify-center rounded border bg-primaryColor px-4 py-2 text-white transition'
          aria-label='Áp dụng bộ lọc'
        >
          <FilterOutlined className='mr-1' /> Áp dụng
        </Button>
      </div>
    </div>
  );
}
