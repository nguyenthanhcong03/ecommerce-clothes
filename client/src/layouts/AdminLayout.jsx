import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '@components/AdminSidebar/AdminSidebar';
import AdminHeader from '@components/AdminHeader/AdminHeader';
import ScrollToTop from '@components/ScrollToTop/ScrollToTop';

// import { Switch, Route, Redirect } from 'react-router-dom';

// components

import AdminNavbar from '@components/AdminComponents/Navbars/AdminNavbar.jsx';
import Sidebar from '@components/AdminComponents/common/Sidebar.jsx';
import HeaderStats from '@components/AdminComponents/Headers/HeaderStats.jsx';
import FooterAdmin from '@components/AdminComponents/Footers/FooterAdmin.jsx';

// views

// import Dashboard from 'views/admin/Dashboard.js';
// import Maps from 'views/admin/Maps.js';
// import Settings from 'views/admin/Settings.js';
// import Tables from 'views/admin/Tables.js';

const AdminLayout = () => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const user = useSelector((state) => state.account.user);
  const userRole = user.role;

  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const handleLogout = async () => {
  //   const res = await callLogout();
  //   if (res && res.data) {
  //     dispatch(doLogoutAction());
  //     message.success('Đăng xuất thành công');
  //     navigate('/');
  //   }
  // };

  return (
    <div>
      {/* <div className='dark:bg-darkgray flex min-h-screen w-full'>
        <div className='page-wrapper flex w-full'>
          <AdminSidebar />
          <div className='page-wrapper-sub dark:bg-darkgray flex w-full flex-col'>
            <AdminHeader />

            <div className={`bg-lightgray dark:bg-dark rounded-bb h-full`}>
              <div className={`w-full`}>
                <ScrollToTop>
                  <div className='py-30 container'>
                    <Outlet />
                  </div>
                </ScrollToTop>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <>
        <div className='flex h-screen overflow-hidden bg-white text-primaryColor'>
          {/* BG */}
          {/* <div className='fixed inset-0 z-0'>
            <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
            <div className='absolute inset-0 backdrop-blur-sm' />
          </div> */}

          <Sidebar />
          <Outlet />
        </div>
      </>
    </div>
  );
};

export default AdminLayout;
