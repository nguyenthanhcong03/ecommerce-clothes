import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

// Button variants using class-variance-authority for better organization
const buttonVariants = cva(
  // Base styles applied to all button variants
  'inline-flex items-center justify-center rounded-sm transition-all relative disabled:pointer-events-none disabled:opacity-50 focus:outline-none',
  {
    variants: {
      // Different visual variants
      variant: {
        primary: 'bg-primaryColor hover:bg-opacity-90 transition duration-300 text-white',
        secondary: 'bg-white border border-primaryColor transition duration-300 hover:bg-neutral-100 text-text1',
        outline: 'border border-primaryColor bg-white text-primaryColor',
        ghost: 'bg-transparent hover:bg-gray-100 text-primaryColor',
        link: 'bg-transparent underline-offset-4 hover:underline text-primaryColor p-0 height-auto',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white'
      },
      // Different sizing options
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-5 py-2.5 text-base',
        xl: 'h-14 px-6 py-3 text-lg',
        icon: 'h-9 w-9'
      },
      // Different width options
      width: {
        auto: 'w-auto',
        full: 'w-full'
      },
      // Loading state appearance
      isLoading: {
        true: 'relative text-transparent transition-none hover:text-transparent'
      }
    },
    // Default variant combinations
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      width: 'auto',
      isLoading: false
    }
  }
);

const Button = forwardRef(
  (
    {
      children,
      className,
      variant,
      size,
      width,
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, width, isLoading }), className)}
        disabled={disabled || isLoading}
        onClick={isLoading ? undefined : onClick}
        {...props}
      >
        {isLoading && (
          <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
            <svg
              className='h-5 w-5 animate-spin text-current'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          </span>
        )}
        {leftIcon && !isLoading && (
          <span className={cn('mr-2', size === 'xs' || size === 'sm' ? 'text-sm' : '')}>{leftIcon}</span>
        )}
        {children}
        {rightIcon && !isLoading && (
          <span className={cn('ml-2', size === 'xs' || size === 'sm' ? 'text-sm' : '')}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'success']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'icon']),
  width: PropTypes.oneOf(['auto', 'full']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func
};

export default Button;
