import React from 'react';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'error', 'success', 'warning'
  size, // 'small', 'medium', 'large'
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button', // 'button', 'submit', 'reset'
  className = '' // Custom classes
}) => {
  // Xác định các lớp CSS dựa trên variant, color, size, và các thuộc tính khác
  const getButtonClasses = () => {
    let baseClasses =
      'px-2 py-1 text-[10px] sm:px-2 sm:py-2 sm:text-sm md:px-3 md:py-2 md:text-base lg:px-4 lg:py-2 lg:text-base rounded-[4px] font-[350] focus:outline-none transition-colors duration-200 flex items-center justify-center';

    // Kích thước (size)
    switch (size) {
      case 'small':
        baseClasses =
          'px-2 py-1 text-sm rounded-[4px] font-[350] focus:outline-none transition-colors duration-200 flex items-center justify-center';
        break;
      case 'medium':
        baseClasses =
          'px-4 py-2 text-base rounded-[4px] font-[350] focus:outline-none transition-colors duration-200 flex items-center justify-center';
        break;
      case 'large':
        baseClasses =
          'px-6 py-3 text-lg rounded-[4px] font-[350] focus:outline-none transition-colors duration-200 flex items-center justify-center';
        break;
      default:
        break;
    }

    switch (variant) {
      case 'primary':
        baseClasses += ' bg-primaryColor text-white hover:bg-primaryColor/90';
        break;
      case 'secondary':
        baseClasses += ' bg-white text-text1 hover:bg-gray-100 border-[1px] border-primaryColor';
        break;
      case 'error':
        baseClasses += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
        break;
      case 'success':
        baseClasses += ' bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
        break;
      case 'warning':
        baseClasses += ' bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500';
        break;
      default:
        baseClasses += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }

    // Custom classes
    if (className) {
      baseClasses += ` ${className}`;
    }

    // Màu sắc và kiểu (variant và color)
    if (disabled) {
      return `${baseClasses} cursor-not-allowed opacity-70`;
    }

    return baseClasses;
  };

  return (
    <button type={type} className={getButtonClasses()} disabled={disabled} onClick={onClick}>
      {startIcon && <span className=''>{startIcon}</span>}
      {children}
      {endIcon && <span className=''>{endIcon}</span>}
    </button>
  );
};

export default Button;
