import React, { useState, useEffect } from 'react';

const QuantityInput2 = ({ value = 1, min = 1, max = 99, onChange, onFinalChange }) => {
  const [inputValue, setInputValue] = useState(value);
  console.log('inputValue2', inputValue);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleDecrease = () => {
    const newValue = Math.max(min, inputValue - 1);
    setInputValue(newValue);
    onChange?.(newValue);
    onFinalChange?.(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, inputValue + 1);
    setInputValue(newValue);
    onChange?.(newValue);
    onFinalChange?.(newValue);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputValue(val === '' ? '' : parseInt(val, 10));
      onChange?.(val === '' ? '' : parseInt(val, 10));
    }
  };

  const handleBlur = () => {
    let newValue = parseInt(inputValue) || min;
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    setInputValue(newValue);
    onFinalChange?.(newValue);
  };

  return (
    <div className='flex w-fit items-center overflow-hidden rounded border border-gray-300'>
      <button
        onClick={handleDecrease}
        className='bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50'
        disabled={inputValue <= min}
      >
        -
      </button>
      <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className='w-12 border-x border-gray-300 text-center outline-none'
      />
      <button
        onClick={handleIncrease}
        className='bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50'
        disabled={inputValue >= max}
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput2;
