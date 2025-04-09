import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPopper } from '@popperjs/core';

const PagesDropdown = () => {
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
        className='lg:hover:text-blueGray-200 text-blueGray-700 flex items-center px-3 py-4 text-xs font-bold uppercase lg:py-2 lg:text-white'
        href='#pablo'
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        Demo Pages
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? 'block ' : 'hidden ') +
          'z-50 float-left min-w-48 list-none rounded bg-white py-2 text-left text-base shadow-lg'
        }
      >
        <span className='text-blueGray-400 block w-full whitespace-nowrap bg-transparent px-4 pb-0 pt-2 text-sm font-bold'>
          Admin Layout
        </span>
        <Link
          to='/admin/dashboard'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
        >
          Dashboard
        </Link>
        <Link
          to='/admin/settings'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
        >
          Settings
        </Link>
        <Link
          to='/admin/tables'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
        >
          Tables
        </Link>
        <Link
          to='/admin/maps'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
        >
          Maps
        </Link>
        <div className='border-blueGray-100 mx-4 my-2 h-0 border border-solid' />
        <span className='text-blueGray-400 block w-full whitespace-nowrap bg-transparent px-4 pb-0 pt-2 text-sm font-bold'>
          Auth Layout
        </span>
        <Link
          to='/auth/login'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
        >
          Login
        </Link>
        <Link
          to='/auth/register'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
        >
          Register
        </Link>
        <div className='border-blueGray-100 mx-4 my-2 h-0 border border-solid' />
        <span className='text-blueGray-400 block w-full whitespace-nowrap bg-transparent px-4 pb-0 pt-2 text-sm font-bold'>
          No Layout
        </span>
        <Link
          to='/landing'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
        >
          Landing
        </Link>
        <Link
          to='/profile'
          className='text-blueGray-700 block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal'
        >
          Profile
        </Link>
      </div>
    </>
  );
};

export default PagesDropdown;
