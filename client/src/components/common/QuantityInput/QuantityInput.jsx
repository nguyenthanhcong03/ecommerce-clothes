import React from 'react';

const QuantityInput = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'medium' // small, medium, large
}) => {
  const handleDecrease = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const handleChange = (e) => {
    if (disabled) return;

    const val = parseInt(e.target.value) || min;
    if (val >= min && val <= max) {
      onChange(val);
    }
  };

  const sizeClasses = {
    small: 'h-7 text-sm',
    medium: 'h-9 text-base',
    large: 'h-11 text-lg'
  };

  const buttonClasses = `
    ${sizeClasses[size]}
    px-2
    flex
    items-center
    justify-center
    transition-colors
    border
    ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-[#F9F9F9] active:bg-[#F1f1f1]'}
  `;

  const inputClasses = `
    ${sizeClasses[size]}
    w-8
    border
    text-center
    focus:outline-none
    focus:ring-2
    focus:ring-[#333]
    ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'}
  `;

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={handleDecrease}
        className={buttonClasses}
        disabled={disabled || value <= min}
        aria-label='Decrease quantity'
      >
        <span className='font-medium'>−</span>
      </button>

      <input
        type='text'
        value={value}
        onChange={handleChange}
        className={inputClasses}
        disabled={disabled}
        min={min}
        max={max}
        aria-label='Quantity'
      />

      <button
        type='button'
        onClick={handleIncrease}
        className={buttonClasses}
        disabled={disabled || value >= max}
        aria-label='Increase quantity'
      >
        <span className='font-medium'>+</span>
      </button>
    </div>
  );
};

export default QuantityInput;
