import avatarDefault from '@/assets/images/user.png';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const UserDropdown = ({ handleLogout }) => {
  const { isAuthenticated, user } = useSelector((state) => state.account);
  return (
    <div>
      <ul className='absolute right-0 top-8 z-10 flex h-fit w-[275px] flex-col rounded-lg bg-white px-6 py-2 shadow-lg transition-all duration-300 ease-in after:absolute after:right-2 after:top-[-8px] after:w-3 after:cursor-pointer after:border-b-[15px] after:border-l-[25px] after:border-r-[25px] after:border-transparent after:border-b-white'>
        <Link to={'/user/profile'} className='flex items-center gap-4'>
          <img src={avatarDefault} alt='' className='h-[50px] w-[50px] rounded-full' />
          <div className='flex flex-col justify-center'>
            <p className='text-base font-medium text-primaryColor'>
              {user?.lastName + ' ' + user?.firstName || 'Nguyen Van A'}
            </p>
            <p className='text-sm'>@{user?.username || 'username'}</p>
          </div>
        </Link>
        <hr className='my-2' />
        <ul>
          <li className='cursor-pointer rounded-md px-[10px] py-[10px] text-sm text-[#666] hover:bg-[#f7f7f7] hover:text-primaryColor'>
            <Link to={'/user/profile'} className='py-2'>
              Trang cá nhân
            </Link>
          </li>
          {isAuthenticated && user?.role === 'admin' && (
            <li className='cursor-pointer rounded-md px-[10px] py-[10px] text-sm text-[#666] hover:bg-[#f7f7f7] hover:text-primaryColor'>
              <Link to={'/admin'} className='py-2'>
                Trang quản trị
              </Link>
            </li>
          )}
        </ul>
        <hr className='my-2' />
        <ul>
          <li className='cursor-pointer rounded-md px-[10px] py-[10px] text-sm text-[#666] hover:bg-[#f7f7f7] hover:text-primaryColor'>
            <Link className='py-2 text-[#666] hover:text-primaryColor'>Viết blog</Link>
          </li>
          <li className='cursor-pointer rounded-md px-[10px] py-[10px] text-sm text-[#666] hover:bg-[#f7f7f7] hover:text-primaryColor'>
            <Link className='py-2 text-[#666] hover:text-primaryColor'>Bài viết của tôi</Link>
          </li>
          <li className='cursor-pointer rounded-md px-[10px] py-[10px] text-sm text-[#666] hover:bg-[#f7f7f7] hover:text-primaryColor'>
            <Link className='py-2 text-[#666] hover:text-primaryColor'>Bài viết đã lưu</Link>
          </li>
        </ul>
        <hr className='my-2' />
        <ul>
          <li className='cursor-pointer rounded-md px-[10px] py-[10px] text-sm text-[#666] hover:bg-[#f7f7f7] hover:text-primaryColor'>
            <span className='py-2 text-[#666] hover:text-primaryColor'>Cài đặt</span>
          </li>
          <li className='cursor-pointer rounded-md px-[10px] py-[10px] text-sm text-[#666] hover:bg-[#f7f7f7] hover:text-primaryColor'>
            <span className='py-2 text-[#666] hover:text-primaryColor' onClick={handleLogout}>
              Đăng xuất
            </span>
          </li>
        </ul>
      </ul>
    </div>
  );
};

export default UserDropdown;
