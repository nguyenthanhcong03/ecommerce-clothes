import React, { useRef, useState } from 'react';
import { createPopper } from '@popperjs/core';
import team1 from '@assets/img/team-1-800x800.jpg';

const UserDropdown = () => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = useRef(null);
  const popoverDropdownRef = useRef(null);

  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: 'bottom-start'
    });
    setDropdownPopoverShow(true);
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  return (
    <>
      <a
        className='text-blueGray-500 block'
        href='#pablo'
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div className='flex items-center'>
          <span className='bg-blueGray-200 inline-flex h-12 w-12 items-center justify-center rounded-full text-sm text-white'>
            <img alt='...' className='w-full rounded-full border-none align-middle shadow-lg' src={team1} />
          </span>
        </div>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? 'block ' : 'hidden ') +
          'z-50 float-left min-w-48 list-none rounded bg-white py-2 text-left text-base shadow-lg'
        }
      >
        {/* Dropdown content */}
        <a
          href='#pablo'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
          onClick={(e) => e.preventDefault()}
        >
          Action
        </a>
        <a
          href='#pablo'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
          onClick={(e) => e.preventDefault()}
        >
          Another action
        </a>
        <a
          href='#pablo'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
          onClick={(e) => e.preventDefault()}
        >
          Something else here
        </a>
        <div className='border-blueGray-100 my-2 h-0 border border-solid' />
        <a
          href='#pablo'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
          onClick={(e) => e.preventDefault()}
        >
          Separated link
        </a>
      </div>
    </>
  );
};

export default UserDropdown;
