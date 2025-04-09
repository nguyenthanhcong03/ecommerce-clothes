import React, { useState, useRef } from 'react';
import { createPopper } from '@popperjs/core';

const NotificationDropdown = () => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = useRef(null);
  const popoverDropdownRef = useRef(null);

  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: 'left-start'
    });
    setDropdownPopoverShow(true);
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  return (
    <>
      <a
        className='text-blueGray-500 px-3 py-1'
        href='#pablo'
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <i className='fas fa-ellipsis-v'></i>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? 'block ' : 'hidden ') +
          'z-50 float-left min-w-48 list-none rounded bg-white py-2 text-left text-base shadow-lg'
        }
      >
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
      </div>
    </>
  );
};

export default NotificationDropdown;
