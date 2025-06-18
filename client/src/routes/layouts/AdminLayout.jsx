import { Outlet } from 'react-router-dom';

import AdminSidebar from '@/components/AdminComponents/common/AdminSidebar.jsx';

const AdminLayout = () => {
  return (
    <div className='flex h-screen overflow-hidden bg-white text-primaryColor'>
      <AdminSidebar />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
