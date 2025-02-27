// import React, { Children, useState } from 'react';
// import { IoAddOutline } from 'react-icons/io5';

// function Collapse({ children, title, isShow = false, isFooter = false }) {
//   const [isOpen, setIsOpen] = useState(isShow);

//   const handleToggleCollapse = () => setIsOpen(!isOpen);
//   return (
//     <div className='w-full'>
//       <button
//         onClick={handleToggleCollapse}
//         className='flex w-full items-center justify-between rounded-md px-4 py-2 text-left text-white'
//       >
//         <h4 className='w-full text-start text-sm text-primaryColor md:text-base'>{title}</h4>
//         <svg
//           className={`h-5 w-5 transform text-primaryColor transition-transform ${isFooter ? 'md:hidden' : ''} ${isOpen ? 'rotate-180' : 'rotate-0'}`}
//           xmlns='http://www.w3.org/2000/svg'
//           fill='none'
//           viewBox='0 0 24 24'
//           stroke='currentColor'
//         >
//           <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
//         </svg>
//       </button>
//       <div
//         className={`transition-max-height overflow-hidden text-sm text-secondaryColor duration-300 ${isShow ? 'max-h-[500px]' : ''} md:text-base ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// export default Collapse;

import React, { useState } from 'react';

function Collapse({ children, title, isShow = false, isFooter = false }) {
  const [isOpen, setIsOpen] = useState(isShow);

  const handleToggleCollapse = () => setIsOpen(!isOpen);

  return (
    <div className='w-full'>
      <button
        onClick={handleToggleCollapse}
        className='flex w-full items-center justify-between rounded-md px-4 py-2 text-left text-white'
      >
        <h4 className='w-full text-start text-sm text-primaryColor md:text-base'>{title}</h4>
        <svg
          className={`h-5 w-5 transform text-primaryColor transition-transform duration-300 ${isFooter ? 'md:hidden' : ''} ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className='px-4 py-2 text-sm text-secondaryColor md:text-base'>{children}</div>
      </div>
    </div>
  );
}

export default Collapse;
