import { useState } from 'react';
import InputNumber from '@/components/common/InputNumber/InputNumberDTD'; // Giữ nguyên, giả định bạn có sẵn component này
import { use } from 'react';
import useDebounce from '@/hooks/useDebounce';

export default function QuantityController({
  // max,
  max = 999,
  min = 1,
  onIncrease,
  onDecrease,
  onType,
  onFocusOut,
  classNameWrapper = 'ml-10',
  value,
  ...rest
}) {
  const [localValue, setLocalValue] = useState(Number(value || 0));

  const handleChange = (event) => {
    let _value = Number(event.target.value);
    if (max !== undefined && _value > max) _value = max;
    if (_value < 1) _value = 1;

    onType && onType(_value);
    setLocalValue(_value);
  };

  const handleIncrease = () => {
    let _value = Number(value || localValue) + 1;
    if (max !== undefined && _value > max) _value = max;

    onIncrease && onIncrease(_value);
    setLocalValue(_value);
    // const newValue = Math.min(max, localValue + 1);
    // onIncrease && onIncrease(newValue);
    // setLocalValue(newValue);
  };

  const handleDecrease = () => {
    let _value = Number(value || localValue) - 1;
    if (_value < 1) _value = 1;

    onDecrease && onDecrease(_value);
    setLocalValue(_value);
    console.log('localValue', localValue);
    // const newValue = Math.max(min, localValue - 1);
    // onDecrease && onDecrease(newValue);
    // setLocalValue(newValue);
  };

  const handleBlur = (event) => {
    onFocusOut && onFocusOut(Number(event.target.value));
  };

  return (
    <div className={`flex items-center ${classNameWrapper}`}>
      <button
        className='flex h-8 w-8 items-center justify-center rounded-l-sm border border-gray-300 text-gray-600'
        onClick={handleDecrease}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-4 w-4'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 12h-15' />
        </svg>
      </button>

      <InputNumber
        className=''
        classNameError='hidden'
        classNameInput='h-8 w-14 border-t border-b border-gray-300 p-1 text-center outline-none'
        onChange={handleChange}
        onBlur={handleBlur}
        value={value || localValue}
        {...rest}
      />

      <button
        className='flex h-8 w-8 items-center justify-center rounded-r-sm border border-gray-300 text-gray-600'
        onClick={handleIncrease}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-4 w-4'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
        </svg>
      </button>
    </div>
  );
}
