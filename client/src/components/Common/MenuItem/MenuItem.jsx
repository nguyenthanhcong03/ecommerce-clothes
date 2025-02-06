import React from 'react';
import { Link } from 'react-router-dom';
import { menuData } from './constant';

function MenuItem({ href, text, isMenuDropDown = false }) {
  return (
    <Link to={href}>
      <div className='group relative'>
        <div className='relative flex cursor-pointer items-center justify-center gap-2 pt-[3px] after:absolute after:top-full after:hidden after:h-[20px] after:w-full after:bg-transparent after:content-[""] after:group-hover:block'>
          <span className='mt-[6px] after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:transition-opacity after:transition-transform after:duration-300 after:content-[""] group-hover:after:scale-100 group-hover:after:opacity-100'>
            {text}
          </span>
          {isMenuDropDown && (
            <svg
              className='mt-[3px] h-5 w-5 rotate-0 transform transition-transform group-hover:rotate-180'
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
          <ul className='absolute top-[40px] hidden w-[200px] flex-col overflow-hidden rounded bg-white text-sm text-primaryColor shadow-md group-hover:flex'>
            {menuData.map((item) => (
              <Link to={item.path} key={item.id} className='p-3 hover:bg-[#F1F1F1] hover:text-secondaryColor'>
                {item.title}
              </Link>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}

export default MenuItem;
