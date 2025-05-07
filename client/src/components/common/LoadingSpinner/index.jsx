import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'medium', fullPage = false }) => {
  // Size classes for the spinner
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  // Wrapper classes based on whether it's full page or inline
  const wrapperClasses = fullPage
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={wrapperClasses} data-testid='loading-spinner'>
      <div className='relative'>
        <div className={`${sizeClasses[size]} rounded-full border-4 border-solid border-gray-200`}></div>
        <div
          className={`${sizeClasses[size]} absolute left-0 top-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent`}
        ></div>
      </div>
      {/* <div className='flex h-screen w-full items-center justify-center bg-white'>
        <div className='h-12 w-12 animate-spin rounded-full border-t-4 border-solid border-primaryColor'></div>
      </div> */}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullPage: PropTypes.bool
};

export default LoadingSpinner;
