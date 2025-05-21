import React, { Fragment, useRef } from 'react';
import { XCircle } from 'lucide-react';

export const Modal2 = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  if (!isOpen) return null;

  // Đóng modal khi click bên ngoài
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className='fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50'
        onClick={handleOutsideClick}
      >
        {/* Modal */}
        <div
          ref={modalRef}
          className='animate-fade-in mx-4 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-lg'
        >
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
            <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-500 focus:outline-none'>
              <XCircle size={20} />
            </button>
          </div>

          {/* Content */}
          <div className='overflow-y-auto'>{children}</div>
        </div>
      </div>
    </Fragment>
  );
};

export default Modal2;
