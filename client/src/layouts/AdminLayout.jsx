import React, { useState } from 'react';
import { use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const user = useSelector((state) => state.account.user);
  const userRole = user.role;

  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res.data) {
      dispatch(doLogoutAction());
      message.success('Đăng xuất thành công');
      navigate('/');
    }
  };
  return (
    <div>
      {isAdminRoute && userRole === 'admin' && <div>header</div>}
      <Outlet />
      {isAdminRoute && userRole === 'admin' && <div>footer</div>}
    </div>
  );
};

export default AdminLayout;
