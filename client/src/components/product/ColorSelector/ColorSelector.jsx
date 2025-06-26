import { COLOR_OPTIONS } from '@/utils/constants';

const ColorSelector = ({
  colors = [],
  selectedColor,
  selectedSize,
  getAvailableColors,
  onColorSelect,
  isColorOutOfStock
}) => {
  return (
    <div className='mt-1 flex flex-wrap gap-1 sm:mt-2 sm:gap-2'>
      {colors &&
        colors.length > 0 &&
        colors.map((color) => {
          const isAvailable = !selectedSize || getAvailableColors(selectedSize).includes(color);
          const isOutOfStock = isColorOutOfStock ? isColorOutOfStock(color) : false;
          const isDisabled = !isAvailable || isOutOfStock;

          return (
            <div key={color} className='group relative'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    onColorSelect(color);
                  }
                }}
                disabled={isDisabled}
                className={`relative flex items-center justify-center rounded-sm border px-2 py-1 text-sm transition ${
                  selectedColor === color
                    ? 'border-primaryColor bg-primaryColor font-medium text-white'
                    : !isDisabled
                      ? 'border-gray-300 bg-white text-gray-700 hover:border-primaryColor hover:bg-gray-50'
                      : 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <span className='text-sm'>{color}</span>
              </button>
              {isOutOfStock && (
                <div className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                  Hết hàng
                </div>
              )}

              {selectedColor === color && (
                <div className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primaryColor text-xs text-white'>
                  ✓
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default ColorSelector;
