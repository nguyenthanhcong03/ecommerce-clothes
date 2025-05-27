import { SIZE_OPTIONS } from '@/utils/constants';
import React from 'react';

const SizeSelector = ({ sizes = [], selectedSize, selectedColor, getAvailableSizes, onSizeSelect }) => {
  return (
    <div className='mt-1 flex flex-wrap gap-1 sm:mt-2 sm:gap-2'>
      {sizes.map((size) => {
        const isAvailable = !selectedColor || getAvailableSizes(selectedColor).includes(size);
        return (
          <button
            key={size}
            onClick={(e) => {
              e.stopPropagation();
              onSizeSelect(size);
            }}
            disabled={!isAvailable}
            className={`h-[28px] min-w-[28px] border text-xs text-primaryColor sm:h-[30px] sm:min-w-[30px] ${
              selectedSize === size
                ? 'border-black'
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
  );
};

export default SizeSelector;
