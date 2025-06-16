import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/helpers/cn';
import Button from '@/components/common/Button';

// Popup variants using class-variance-authority for better organization
const popupVariants = cva(
  // Base styles applied to all popup variants
  'fixed z-50 bg-white rounded-md shadow-lg overflow-hidden transition-all duration-300',
  {
    variants: {
      // Different size options
      size: {
        xs: 'max-w-xs w-full',
        sm: 'max-w-sm w-full',
        md: 'max-w-md w-full',
        lg: 'max-w-lg w-full',
        xl: 'max-w-xl w-full',
        '2xl': 'max-w-2xl w-full',
        '3xl': 'max-w-3xl w-full',
        '4xl': 'max-w-4xl w-full',
        '5xl': 'max-w-5xl w-full',
        full: 'w-full h-full'
      },
      // Different position options
      position: {
        center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        top: 'top-4 left-1/2 -translate-x-1/2',
        bottom: 'bottom-4 left-1/2 -translate-x-1/2',
        left: 'left-4 top-1/2 -translate-y-1/2',
        right: 'right-4 top-1/2 -translate-y-1/2'
      }
    },
    // Default variant combinations
    defaultVariants: {
      size: 'md',
      position: 'center'
    }
  }
);

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size,
  position,
  hideCloseButton = false,
  overlayClassName = '',
  className = '',
  closeOnEsc = true
}) => {
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.classList.add('no-scroll');
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-40 flex items-center justify-center'>
      <div
        className={cn('fixed inset-0 bg-black bg-black/50 transition-opacity duration-300', overlayClassName)}
        onClick={onClose}
      />

      <div className={cn(popupVariants({ size, position }), className)}>
        {title && (
          <div className='flex items-center justify-between border-b px-6 py-4'>
            <h3 className='text-lg font-medium'>{title}</h3>
            {!hideCloseButton && (
              <button className='rounded-full p-1 hover:bg-gray-100' onClick={onClose}>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className='p-6'>{children}</div>
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full']),
  position: PropTypes.oneOf(['center', 'top', 'bottom', 'left', 'right']),
  hideCloseButton: PropTypes.bool,
  overlayClassName: PropTypes.string,
  className: PropTypes.string,
  closeOnEsc: PropTypes.bool
};

export default Modal;
