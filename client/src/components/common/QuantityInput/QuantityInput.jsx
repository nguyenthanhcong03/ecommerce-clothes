import React, { useEffect, useState } from 'react';

const QuantityInput = ({
  value = 1,
  min = 1,
  max = 999,
  onChange,
  disabled = false,
  className = '',
  buttonClassName = '',
  inputClassName = ''
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleDecrease = () => {
    const newValue = Math.max(min, inputValue - 1);
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, inputValue + 1);
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputValue(val === '' ? '' : parseInt(val, 10));
    }
  };

  const handleBlur = () => {
    let newValue = parseInt(inputValue) || min;
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`flex w-fit items-center overflow-hidden rounded-sm border border-gray-300 ${className}`}>
      <button
        onClick={handleDecrease}
        className={`flex h-7 w-8 items-center justify-center bg-gray-100 px-2 py-1 transition-colors hover:bg-gray-200 disabled:opacity-50 ${buttonClassName}`}
        disabled={disabled || inputValue <= min}
      >
        -
      </button>
      <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`w-12 border-x border-gray-300 text-center outline-none ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white'} ${inputClassName}`}
      />
      <button
        onClick={handleIncrease}
        className={`flex h-7 w-8 items-center justify-center bg-gray-100 px-2 py-1 transition-colors hover:bg-gray-200 disabled:opacity-50 ${buttonClassName}`}
        disabled={disabled || inputValue >= max}
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
