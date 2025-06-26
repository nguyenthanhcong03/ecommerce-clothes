const SizeSelector = ({
  sizes = [],
  selectedSize,
  selectedColor,
  getAvailableSizes,
  onSizeSelect,
  isSizeOutOfStock
}) => {
  return (
    <div className='mt-1 flex flex-wrap gap-1 sm:mt-2 sm:gap-2'>
      {sizes.map((size) => {
        const isAvailable = !selectedColor || getAvailableSizes(selectedColor).includes(size);
        const isOutOfStock = isSizeOutOfStock ? isSizeOutOfStock(size) : false;
        const isDisabled = !isAvailable || isOutOfStock;

        return (
          <div className='group relative' key={size}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  onSizeSelect(size);
                }
              }}
              disabled={isDisabled}
              className={`relative flex h-8 w-8 items-center justify-center rounded-sm border transition ${
                selectedSize === size
                  ? 'border-primaryColor bg-primaryColor font-medium text-white'
                  : !isDisabled
                    ? 'border-gray-300 bg-white text-gray-700 hover:border-primaryColor hover:bg-gray-50'
                    : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50'
              }`}
            >
              <span className='text-sm'>{size}</span>
            </button>
            {isOutOfStock && (
              <div className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                Hết hàng
              </div>
            )}
            {selectedSize === size && (
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

export default SizeSelector;
