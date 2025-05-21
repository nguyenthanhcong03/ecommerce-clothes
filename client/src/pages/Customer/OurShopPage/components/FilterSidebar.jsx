import { colorOptions, sizeOptions } from '@/constants/colors';
import { CloseOutlined, StarFilled } from '@ant-design/icons';
import PropTypes from 'prop-types';

export function FilterSidebar({
  isFilterOpen,
  setIsFilterOpen,
  searchTerm,
  setSearchTerm,
  priceRange,
  setPriceRange,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  selectedRating,
  setSelectedRating,
  onFilterChange,
  onResetFilter
}) {
  const handlePriceChange = (value, type) => {
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);

    // Only update filters if both values are valid
    if (!newPriceRange.min || !newPriceRange.max || parseInt(newPriceRange.min) <= parseInt(newPriceRange.max)) {
      onFilterChange({ minPrice: newPriceRange.min, maxPrice: newPriceRange.max });
    }
  };

  const handleToggleColor = (color) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    onFilterChange({ colors: newColors });
  };

  const handleToggleSize = (size) => {
    const newSizes = selectedSizes.includes(size) ? selectedSizes.filter((s) => s !== size) : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    onFilterChange({ sizes: newSizes });
  };

  const handleRatingChange = (rating) => {
    const newRating = selectedRating === rating ? 0 : rating;
    setSelectedRating(newRating);
    onFilterChange({ rating: newRating.toString() });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <button
        key={index}
        className={`cursor-pointer ${index < selectedRating ? 'text-yellow-400' : 'text-gray-300'}`}
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
        <h3 className='text-md mb-2 font-medium'>Khoảng giá</h3>
        <div className='flex items-center gap-2'>
          <div className='w-full'>
            <label htmlFor='min-price' className='sr-only'>
              Giá thấp nhất
            </label>
            <input
              id='min-price'
              type='number'
              value={priceRange.min}
              onChange={(e) => handlePriceChange(e.target.value, 'min')}
              placeholder='Từ'
              min='0'
              aria-label='Giá thấp nhất'
              className='focus:ring-primary-300 focus:border-primary-400 w-full rounded-md border border-gray-300 p-2 focus:ring-2'
            />
          </div>
          <span className='text-gray-500'>-</span>
          <div className='w-full'>
            <label htmlFor='max-price' className='sr-only'>
              Giá cao nhất
            </label>
            <input
              id='max-price'
              type='number'
              value={priceRange.max}
              onChange={(e) => handlePriceChange(e.target.value, 'max')}
              placeholder='Đến'
              min='0'
              aria-label='Giá cao nhất'
              className='focus:ring-primary-300 focus:border-primary-400 w-full rounded-md border border-gray-300 p-2 focus:ring-2'
            />
          </div>
        </div>
        {priceRange.min && priceRange.max && parseInt(priceRange.min) > parseInt(priceRange.max) && (
          <p className='mt-1 text-sm text-red-500'>Giá thấp nhất không thể lớn hơn giá cao nhất</p>
        )}
      </div>

      {/* Colors */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-md mb-2 font-medium'>Màu sắc</h3>
          {selectedColors.length > 0 && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => {
                setSelectedColors([]);
                onFilterChange({ colors: [] });
              }}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex flex-wrap gap-3'>
          {colorOptions.map((color, index) => (
            <div key={index} className='group relative'>
              <button
                onClick={() => handleToggleColor(color.name)}
                className={`h-6 w-6 transform rounded-full border transition hover:scale-125 ${
                  selectedColors.includes(color.name) ? 'scale-125 border-[#333]' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
                aria-pressed={selectedColors.includes(color.name)}
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
          {selectedSizes.length > 0 && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => {
                setSelectedSizes([]);
                onFilterChange({ sizes: [] });
              }}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex flex-wrap gap-2'>
          {sizeOptions.map((size) => (
            <button
              key={size.value}
              onClick={() => handleToggleSize(size.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs transition ${
                selectedSizes.includes(size.value)
                  ? 'border-[#333] font-medium'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={selectedSizes.includes(size.value)}
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
          {selectedRating > 0 && (
            <button
              className='text-xs text-gray-600 hover:text-primaryColor'
              onClick={() => {
                setSelectedRating(0);
                onFilterChange({ rating: 0 });
              }}
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <div className='flex items-center text-xl'>{renderStars()}</div>
      </div>

      {/* Filter actions */}
      <div className='mt-6 flex gap-2'>
        <button
          onClick={onResetFilter}
          className='flex flex-1 items-center justify-center rounded bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200'
          aria-label='Đặt lại tất cả bộ lọc'
        >
          <CloseOutlined className='mr-1' /> Đặt lại tất cả
        </button>
      </div>
    </div>
  );
}

FilterSidebar.propTypes = {
  isFilterOpen: PropTypes.bool.isRequired,
  setIsFilterOpen: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func.isRequired,
  priceRange: PropTypes.shape({
    min: PropTypes.string,
    max: PropTypes.string
  }).isRequired,
  setPriceRange: PropTypes.func.isRequired,
  selectedColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedColors: PropTypes.func.isRequired,
  selectedSizes: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedSizes: PropTypes.func.isRequired,
  selectedRating: PropTypes.number.isRequired,
  setSelectedRating: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilter: PropTypes.func.isRequired
};
