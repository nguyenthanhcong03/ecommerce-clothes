import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

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
      disabled = false
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
        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            'block w-full rounded-sm border border-primaryColor px-3 py-2 text-sm',
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primaryColor',
            'focus:outline-none',
            disabled ? 'bg-gray-100 text-gray-500' : '',
            className
          )}
        >
          <option value='' disabled>
            {placeholder}
          </option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className='mt-1 text-sm text-red-600'>{typeof error === 'string' ? error : error.message}</p>}
      </div>
    );
  }
);

// Thêm displayName để dễ debug
Select.displayName = 'Select';

export default Select;
