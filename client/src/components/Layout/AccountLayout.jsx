import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ClipboardList,
  KeyRound,
  LogOut,
  MapPinHouse,
  Star,
  Ticket,
  UserPen,
  UserRound,
  UserRoundCog
} from 'lucide-react';
import { logoutUser } from '@/store/slices/accountSlice';
import { message } from 'antd';

const AccountLayout = () => {
  const location = useLocation();
  const user = useSelector((state) => state.account?.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      message.success('Đăng xuất thành công');
      // Chuyển hướng về trang chủ sau khi đăng xuất
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Đăng xuất không thành công, vui lòng thử lại sau');
      return;
    }
  };

  const navItems = [
    {
      title: 'Thông tin tài khoản',
      items: [
        { name: 'Hồ sơ', path: '/user/profile', icon: <UserRound width={18} /> },
        { name: 'Đổi mật khẩu', path: '/user/change-password', icon: <KeyRound width={18} /> },
        { name: 'Cài đặt quyền riêng tư', path: '/user/privacy-settings', icon: <UserRoundCog width={18} /> }
      ]
    }
  ];
  if (user?.role === 'customer') {
    navItems.push({
      title: 'Đơn hàng và ưu đãi',
      items: [
        { name: 'Đơn mua', path: '/user/order', icon: <ClipboardList width={18} /> },
        { name: 'Đánh giá của tôi', path: '/user/reviews', icon: <Star width={18} /> },
        { name: 'Kho Voucher', path: '/user/vouchers', icon: <Ticket width={18} /> }
      ]
    });
  }

  // Check if the current path matches the item path
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className='mt-[80px] min-h-screen pt-8'>
      {/* Main Content */}
      {/* <div className='mx-auto w-full max-w-[1280px] px-4 py-8 md:px-8'> */}
      <div className='flex flex-col gap-6 md:flex-row'>
        {/* Sidebar */}
        <div className='w-full md:w-1/4'>
          <div className='mb-6 rounded-lg bg-white p-6 shadow'>
            <div className='mb-6 flex items-center space-x-4'>
              <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} className='h-full w-full object-cover' />
                ) : (
                  <span className='text-2xl font-semibold text-gray-600'>{user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-800'>
                  {user?.lastName + ' ' + user?.firstName || 'User'}
                </h2>
                <p className='text-sm text-gray-500'>@{user?.username || 'username'}</p>
                <button
                  className='flex items-center gap-1 text-sm text-[#888]'
                  onClick={() => navigate('/user/profile')}
                >
                  <UserPen width={18} />
                  Sửa hồ sơ
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className='space-y-6'>
              {navItems.map((section, index) => (
                <div key={index} className='space-y-2'>
                  <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-400'>{section.title}</h3>
                  <ul className='space-y-1'>
                    {section.items.map((item, i) => (
                      <li key={i}>
                        <Link
                          to={item.path}
                          className={`flex items-center rounded-md px-3 py-2 text-sm ${
                            isActive(item.path)
                              ? 'bg-blue-50 font-medium text-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {<span className='mr-2'>{item.icon}</span>}
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className='mt-6 border-t border-gray-200 pt-6'>
              <button
                onClick={handleLogout}
                className='flex items-center text-sm font-medium text-red-500 hover:text-red-600'
              >
                <LogOut className='mr-2' />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className='w-full md:w-3/4'>
          <div className='rounded-lg bg-white p-6 shadow'>
            <Outlet />
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default AccountLayout;
