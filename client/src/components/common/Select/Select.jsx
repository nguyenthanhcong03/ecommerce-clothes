import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

// Arrow Down Icon component
const ArrowDownIcon = ({ className = '' }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className={cn('h-5 w-5', className)}>
    <path
      fillRule='evenodd'
      d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
      clipRule='evenodd'
    />
  </svg>
);

const Select = forwardRef(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      label,
      options,
      placeholder = 'Chọn một mục',
      error,
      className = '',
      required = false,
      disabled = false,
      disabledDefault = false
    },
    ref
  ) => {
    return (
      <div className='w-full'>
        {label && (
          <label htmlFor={name} className='mb-1 block text-sm font-medium text-gray-700'>
            {label} {required && <span className='text-red-500'>*</span>}
          </label>
        )}
        <div className='relative'>
          <select
            ref={ref}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={cn(
              'block w-full appearance-none rounded-sm border border-primaryColor px-3 py-2 pr-10 text-sm',
              error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primaryColor',
              'focus:outline-none',
              disabled ? 'bg-gray-100 text-gray-500' : '',
              className
            )}
          >
            <option value='' disabled={disabledDefault}>
              {placeholder}
            </option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
            <ArrowDownIcon className={disabled ? 'text-gray-400' : 'text-gray-700'} />
          </div>
        </div>
        {error && <p className='mt-1 text-sm text-red-600'>{typeof error === 'string' ? error : error.message}</p>}
      </div>
    );
  }
);

// Thêm displayName để dễ debug
Select.displayName = 'Select';

export default Select;
