import { COLOR_OPTIONS } from '@/utils/constants';
import React from 'react';

const ColorSelector = ({ colors = [], selectedColor, selectedSize, getAvailableColors, onColorSelect }) => {
  return (
    <div className='mt-1 flex flex-wrap gap-1 sm:mt-2 sm:gap-2'>
      {colors &&
        colors.length > 0 &&
        colors.map((color) => {
          const isAvailable = !selectedSize || getAvailableColors(selectedSize).includes(color);
          const colorObj = COLOR_OPTIONS.find((c) => c.name === color);
          const hex = colorObj?.hex || '#ccc';

          return (
            <div key={color} className='group relative'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onColorSelect(color);
                }}
                disabled={!isAvailable}
                className={`flex h-6 w-6 transform items-center justify-center rounded-full border transition hover:scale-125 ${
                  selectedColor === color
                    ? 'ring-2 ring-primaryColor'
                    : isAvailable
                      ? 'bg-white text-gray-600 ring-1 ring-primaryColor hover:bg-gray-100'
                      : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                }`}
              >
                <div className='h-5 w-5 rounded-full' style={{ backgroundColor: hex }}></div>
              </button>
              <div className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                {color}
              </div>
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
