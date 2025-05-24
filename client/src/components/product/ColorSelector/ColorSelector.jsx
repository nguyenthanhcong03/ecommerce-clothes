import { COLOR_OPTIONS } from '@/utils/constants';
import React from 'react';

const ColorSelector = ({
  colors = [],
  selectedColor,
  selectedSize,
  colorImageIndexMap,
  setCurrentImageIndex,
  getAvailableColors,
  onColorSelect
}) => {
  return (
    <div className='mt-1 flex flex-wrap gap-1 sm:mt-2 sm:gap-2'>
      {colors &&
        colors.length > 0 &&
        colors.map((color) => {
          const isAvailable = !selectedSize || getAvailableColors(selectedSize).includes(color);
          const colorObj = COLOR_OPTIONS.find((c) => c.name === color);
          const hex = colorObj?.hex || '#ccc';

          return (
            <button
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                onColorSelect(color);
              }}
              onMouseEnter={() => setCurrentImageIndex(colorImageIndexMap[color])}
              onMouseLeave={() => setCurrentImageIndex(0)}
              disabled={!isAvailable}
              className={`h-[25px] w-[25px] rounded-full border p-[2px] text-[10px] sm:text-xs ${
                selectedColor === color
                  ? 'border-black'
                  : isAvailable
                    ? 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                    : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50'
              }`}
            >
              <div className='h-full w-full rounded-full border' style={{ backgroundColor: hex }} title={color} />
            </button>
          );
        })}
    </div>
  );
};

export default ColorSelector;
