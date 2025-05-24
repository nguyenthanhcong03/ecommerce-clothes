import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      label,
      type = 'text',
      placeholder,
      className = '',
      required = false,
      disabled = false,
      prefix,
      suffix,
      error,
      size = 'middle'
    },
    ref
  ) => {
    const sizeClasses = {
      small: 'py-1 px-2 text-xs',
      middle: 'py-2 px-3 text-sm',
      large: 'py-3 px-4 text-lg'
    };

    return (
      <div className='w-full'>
        {label && (
          <label htmlFor={name} className='mb-1 block text-sm font-medium text-gray-700'>
            {label} {required && <span className='text-red-500'>*</span>}
          </label>
        )}

        <div>
          <div
            className={`relative flex items-center rounded-sm border ${error ? 'border-red-500' : 'border-gray-300'} focus-within:border-primaryColor`}
          >
            {prefix && <div className='pl-3 text-gray-500'>{prefix}</div>}
            <input
              ref={ref}
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full bg-transparent outline-none ${sizeClasses[size] || sizeClasses.middle} disabled:bg-gray-100 disabled:text-gray-500 ${className}`}
            />
            {suffix && <div className='pr-3 text-gray-500'>{suffix}</div>}
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
      </div>
    );
  }
);

// Thêm displayName để dễ debug
Input.displayName = 'Input';

export default Input;
