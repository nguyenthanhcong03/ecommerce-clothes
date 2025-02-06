import React, { Children, useState } from 'react';
import { IoAddOutline } from 'react-icons/io5';

function Collapse({ children, title }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleCollapse = () => setIsOpen(!isOpen);
  return (
    <div className='w-full text-secondaryColor'>
      <button onClick={handleToggleCollapse} className='flex w-full items-center justify-between rounded-md text-left'>
        <h4 className='w-full text-start text-sm'>{title}</h4>
        <svg
          className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
        </svg>
      </button>
      <div
        className={`transition-max-height overflow-hidden text-sm duration-500 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
      >
        {children}
      </div>
    </div>
  );
}

export default Collapse;
