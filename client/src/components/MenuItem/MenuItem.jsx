import React from 'react';
import { Link } from 'react-router-dom';

function MenuItem({ href, text, isMenuDropDown = false }) {
  return (
    <Link to={href}>
      <div className='group relative'>
        <div className='relative cursor-pointer gap-2 flex justify-center items-center pt-[3px] after:absolute after:hidden after:h-[20px] after:w-full after:bg-transparent after:top-full after:content-[""] after:group-hover:block'>
          <span className='mt-[6px] after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:transition-opacity after:transition-transform after:duration-300 after:content-[""] group-hover:after:scale-100 group-hover:after:opacity-100'>
            {text}
          </span>
          {isMenuDropDown && (
            <svg
              className='h-5 w-5 mt-[3px] transform transition-transform group-hover:rotate-180 rotate-0'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
            </svg>
          )}
        </div>
        {isMenuDropDown && (
          <ul className='absolute top-[40px] hidden w-[200px] flex-col overflow-hidden rounded bg-white text-sm text-primaryColor group-hover:flex'>
            <li className='p-3 hover:bg-[#F1F1F1] hover:text-secondaryColor'>Tất cả sản phẩm</li>
            <li className='p-3 hover:bg-[#F1F1F1] hover:text-secondaryColor'>Áo thun</li>
            <li className='p-3 hover:bg-[#F1F1F1] hover:text-secondaryColor'>Quần jeans</li>
          </ul>
        )}
      </div>
    </Link>
  );
}

export default MenuItem;
