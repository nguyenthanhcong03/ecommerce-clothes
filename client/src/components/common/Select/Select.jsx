import React, { forwardRef } from 'react';
import { cn } from '@/utils/helpers/cn';

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
              disabled ? 'bg-neutral-100 text-gray-500' : '',
              className
            )}
          >
            <option value='' disabled={disabledDefault}>
              {placeholder}
            </option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
            <ArrowDownIcon className={disabled ? 'text-gray-400' : 'text-gray-700'} />
          </div>
        </div>
        {error && (
          <div className='mt-1 flex items-center text-xs text-red-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='mr-1 h-3.5 w-3.5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            <span>{typeof error === 'string' ? error : error?.message}</span>
          </div>
        )}
      </div>
    );
  }
);

// Thêm displayName để dễ debug
Select.displayName = 'Select';

export default Select;
