/*eslint-disable*/
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import NotificationDropdown from '@components/AdminComponents/Dropdowns/NotificationDropdown.jsx';
import UserDropdown from '@components/AdminComponents/Dropdowns/UserDropdown.jsx';

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = useState('hidden');
  return (
    <>
      <nav className='sticky top-0 z-10 flex flex-wrap items-center justify-between bg-white px-6 py-4 shadow-xl md:fixed md:bottom-0 md:left-0 md:top-0 md:block md:w-64 md:flex-row md:flex-nowrap md:overflow-hidden md:overflow-y-auto'>
        <div className='mx-auto flex w-full flex-wrap items-center justify-between px-0 md:min-h-full md:flex-col md:flex-nowrap md:items-stretch'>
          {/* Toggler */}
          <button
            className='cursor-pointer rounded border border-solid border-transparent bg-transparent px-3 py-1 text-xl leading-none text-black opacity-50 md:hidden'
            type='button'
            onClick={() => setCollapseShow('bg-white m-2 py-3 px-6')}
          >
            haha
            <i className='fas fa-bars'></i>
          </button>
          {/* Brand */}
          <Link
            className='mr-0 inline-block whitespace-nowrap p-4 px-0 text-left text-sm font-bold uppercase text-blue-600 md:block md:pb-2'
            to='/admin'
          >
            Notus React
          </Link>
          {/* User */}
          <ul className='flex list-none flex-wrap items-center md:hidden'>
            <li className='relative inline-block'>
              <NotificationDropdown />
            </li>
            <li className='relative inline-block'>
              <UserDropdown />
            </li>
          </ul>
          {/* Collapse */}
          <div
            className={
              'absolute left-0 right-0 top-0 z-40 h-auto flex-1 items-center overflow-y-auto overflow-x-hidden rounded shadow md:relative md:mt-4 md:flex md:flex-col md:items-stretch md:opacity-100 md:shadow-none ' +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className='mb-4 block border-b border-solid border-blue-200 pb-4 md:hidden md:min-w-full'>
              <div className='flex flex-wrap'>
                <div className='w-6/12'>
                  <Link
                    className='mr-0 inline-block whitespace-nowrap p-4 px-0 text-left text-sm font-bold uppercase text-blue-600 md:block md:pb-2'
                    to='/admin'
                  >
                    Notus React
                  </Link>
                </div>
                <div className='flex w-6/12 justify-end'>
                  <button
                    type='button'
                    className='cursor-pointer rounded border border-solid border-transparent bg-transparent px-3 py-1 text-xl leading-none text-black opacity-50 md:hidden'
                    onClick={() => setCollapseShow('hidden')}
                  >
                    haha
                    <i className='fas fa-times'></i>
                  </button>
                </div>
              </div>
            </div>
            {/* Form */}
            <form className='mb-4 mt-6 md:hidden'>
              <div className='mb-3 pt-0'>
                <input
                  type='text'
                  placeholder='Search'
                  className='h-12 w-full rounded border border-solid border-blue-500 bg-white px-3 py-2 text-base font-normal leading-snug text-blue-600 placeholder-blue-300 shadow-none outline-none focus:outline-none'
                />
              </div>
            </form>

            {/* Divider */}
            <hr className='my-4 md:min-w-full' />
            {/* Heading */}
            <h6 className='text-blueGray-500 block pb-4 pt-1 text-xs font-bold uppercase no-underline md:min-w-full'>
              Admin Layout Pages
            </h6>
            {/* Navigation */}

            <ul className='flex list-none flex-col md:min-w-full md:flex-col'>
              <li className='items-center'>
                <NavLink
                  // className={
                  //   'block py-3 text-xs font-bold uppercase ' +
                  //   (window.location.href.indexOf('/admin') !== -1
                  //     ? 'text-slate-500 hover:text-slate-600'
                  //     : 'text-blue-700 hover:text-blue-500')
                  // }
                  className={({ isActive }) =>
                    isActive
                      ? 'after:block after:h-[3px] after:origin-right after:bg-primaryColor after:duration-300 after:content-[""]'
                      : 'after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:duration-300 after:content-[""] hover:after:scale-100 hover:after:opacity-100'
                  }
                  to='/admin'
                  end
                >
                  <i
                    className={
                      'fas fa-tv mr-2 text-sm ' +
                      (window.location.href.indexOf('/admin') !== -1 ? 'opacity-75' : 'text-blue-300')
                    }
                  ></i>{' '}
                  Dashboard
                </NavLink>
              </li>

              <li className='items-center'>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? 'after:block after:h-[3px] after:origin-right after:bg-primaryColor after:duration-300 after:content-[""]'
                      : 'after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:duration-300 after:content-[""] hover:after:scale-100 hover:after:opacity-100'
                  }
                  to='/admin/settings'
                >
                  <i
                    className={
                      'fas fa-tools mr-2 text-sm ' +
                      (window.location.href.indexOf('/admin/settings') !== -1 ? 'opacity-75' : 'text-blue-300')
                    }
                  ></i>{' '}
                  Settings
                </NavLink>
              </li>

              <li className='items-center'>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? 'after:block after:h-[3px] after:origin-right after:bg-primaryColor after:duration-300 after:content-[""]'
                      : 'after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:duration-300 after:content-[""] hover:after:scale-100 hover:after:opacity-100'
                  }
                  to='/admin/tables'
                >
                  <i
                    className={
                      'fas fa-table mr-2 text-sm ' +
                      (window.location.href.indexOf('/admin/tables') !== -1 ? 'opacity-75' : 'text-blue-300')
                    }
                  ></i>{' '}
                  Tables
                </NavLink>
              </li>
              <li className='items-center'>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? 'after:block after:h-[3px] after:origin-right after:bg-primaryColor after:duration-300 after:content-[""]'
                      : 'after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:duration-300 after:content-[""] hover:after:scale-100 hover:after:opacity-100'
                  }
                  to='/admin/products'
                >
                  <i
                    className={
                      'fas fa-table mr-2 text-sm ' +
                      (window.location.href.indexOf('/admin/tables') !== -1 ? 'opacity-75' : 'text-blue-300')
                    }
                  ></i>{' '}
                  Products
                </NavLink>
              </li>
            </ul>

            {/* Divider */}
            <hr className='my-4 md:min-w-full' />
            {/* Heading */}
            <h6 className='block pb-4 pt-1 text-xs font-bold uppercase text-blue-500 no-underline md:min-w-full'>
              Auth Layout Pages
            </h6>
            {/* Navigation */}

            <ul className='flex list-none flex-col md:mb-4 md:min-w-full md:flex-col'>
              <li className='items-center'>
                <Link
                  className='block py-3 text-xs font-bold uppercase text-blue-700 hover:text-blue-500'
                  to='/auth/login'
                >
                  <i className='fas fa-fingerprint mr-2 text-sm text-blue-400'></i> Login
                </Link>
              </li>

              <li className='items-center'>
                <Link
                  className='block py-3 text-xs font-bold uppercase text-blue-700 hover:text-blue-500'
                  to='/auth/register'
                >
                  <i className='fas fa-clipboard-list mr-2 text-sm text-blue-300'></i> Register
                </Link>
              </li>
            </ul>

            {/* Divider */}
            <hr className='my-4 md:min-w-full' />
            {/* Heading */}
            <h6 className='block pb-4 pt-1 text-xs font-bold uppercase text-blue-500 no-underline md:min-w-full'>
              No Layout Pages
            </h6>
            {/* Navigation */}

            <ul className='flex list-none flex-col md:mb-4 md:min-w-full md:flex-col'>
              <li className='items-center'>
                <Link
                  className='block py-3 text-xs font-bold uppercase text-blue-700 hover:text-blue-500'
                  to='/landing'
                >
                  <i className='fas fa-newspaper mr-2 text-sm text-blue-400'></i> Landing Page
                </Link>
              </li>

              <li className='items-center'>
                <Link
                  className='block py-3 text-xs font-bold uppercase text-blue-700 hover:text-blue-500'
                  to='/profile'
                >
                  <i className='fas fa-user-circle mr-2 text-sm text-blue-400'></i> Profile Page
                </Link>
              </li>
            </ul>

            {/* Divider */}
            <hr className='my-4 md:min-w-full' />
            {/* Heading */}
            <h6 className='block pb-4 pt-1 text-xs font-bold uppercase text-blue-500 no-underline md:min-w-full'>
              Documentation
            </h6>
            {/* Navigation */}
            <ul className='flex list-none flex-col md:mb-4 md:min-w-full md:flex-col'>
              <li className='inline-flex'>
                <a
                  href='https://www.creative-tim.com/learning-lab/tailwind/react/colors/notus'
                  target='_blank'
                  className='mb-4 block text-sm font-semibold text-blue-700 no-underline hover:text-blue-500'
                >
                  <i className='fas fa-paint-brush mr-2 text-base text-blue-300'></i>
                  Styles
                </a>
              </li>

              <li className='inline-flex'>
                <a
                  href='https://www.creative-tim.com/learning-lab/tailwind/react/alerts/notus'
                  target='_blank'
                  className='mb-4 block text-sm font-semibold text-blue-700 no-underline hover:text-blue-500'
                >
                  <i className='fab fa-css3-alt mr-2 text-base text-blue-300'></i>
                  CSS Components
                </a>
              </li>

              <li className='inline-flex'>
                <a
                  href='https://www.creative-tim.com/learning-lab/tailwind/angular/overview/notus'
                  target='_blank'
                  className='mb-4 block text-sm font-semibold text-blue-700 no-underline hover:text-blue-500'
                >
                  <i className='fab fa-angular mr-2 text-base text-blue-300'></i>
                  Angular
                </a>
              </li>

              <li className='inline-flex'>
                <a
                  href='https://www.creative-tim.com/learning-lab/tailwind/js/overview/notus'
                  target='_blank'
                  className='mb-4 block text-sm font-semibold text-blue-700 no-underline hover:text-blue-500'
                >
                  <i className='fab fa-js-square mr-2 text-base text-blue-300'></i>
                  Javascript
                </a>
              </li>

              <li className='inline-flex'>
                <a
                  href='https://www.creative-tim.com/learning-lab/tailwind/nextjs/overview/notus'
                  target='_blank'
                  className='mb-4 block text-sm font-semibold text-blue-700 no-underline hover:text-blue-500'
                >
                  <i className='fab fa-react mr-2 text-base text-blue-300'></i>
                  NextJS
                </a>
              </li>

              <li className='inline-flex'>
                <a
                  href='https://www.creative-tim.com/learning-lab/tailwind/react/overview/notus'
                  target='_blank'
                  className='mb-4 block text-sm font-semibold text-blue-700 no-underline hover:text-blue-500'
                >
                  <i className='fab fa-react mr-2 text-base text-blue-300'></i>
                  React
                </a>
              </li>

              <li className='inline-flex'>
                <a
                  href='https://www.creative-tim.com/learning-lab/tailwind/svelte/overview/notus'
                  target='_blank'
                  className='mb-4 block text-sm font-semibold text-blue-700 no-underline hover:text-blue-500'
                >
                  <i className='fas fa-link mr-2 text-base text-blue-300'></i>
                  Svelte
                </a>
              </li>

              <li className='inline-flex'>
                <a
                  href='https://www.creative-tim.com/learning-lab/tailwind/vue/overview/notus'
                  target='_blank'
                  className='mb-4 block text-sm font-semibold text-blue-700 no-underline hover:text-blue-500'
                >
                  <i className='fab fa-vuejs mr-2 text-base text-blue-300'></i>
                  VueJS
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
