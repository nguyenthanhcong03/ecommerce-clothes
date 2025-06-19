import shopLogo from '@/assets/images/outfitory-logo.png'; // Assuming you have a logo image
import { logoutUser } from '@/store/slices/accountSlice';
import { Button, message, Modal } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2,
  ChartBarStacked,
  LogOut,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

const SIDEBAR_ITEMS = [
  { name: 'Tổng quan', icon: BarChart2, color: '#333', href: '/admin' },
  { name: 'Sản phẩm', icon: ShoppingBag, color: '#333', href: '/admin/products' },
  { name: 'Danh mục', icon: ChartBarStacked, color: '#333', href: '/admin/categories' },
  { name: 'Người dùng', icon: Users, color: '#333', href: '/admin/users' },
  { name: 'Đơn hàng', icon: ShoppingCart, color: '#333', href: '/admin/orders' },
  { name: 'Mã giảm giá', icon: Tag, color: '#333', href: '/admin/coupons' },
  { name: 'Thống kê', icon: TrendingUp, color: '#333', href: '/admin/analytics' },
  { name: 'Đăng xuất', icon: LogOut, color: '#333', href: '/admin/settings' }
];

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOpenModalLogout, setIsOpenModalLogout] = useState(false);

  const handleLogout = async () => {
    dispatch(logoutUser());
    message.success('Đăng xuất thành công');
    navigate('/login');
  };

  return (
    <motion.div
      className={`relative z-10 flex-shrink-0 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className='flex h-full flex-col border-r border-[#e1e1e1] bg-white p-4 text-primaryColor backdrop-blur-md'>
        <div className='flex items-center gap-2'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='max-w-fit rounded-full p-2 transition-colors hover:bg-[#F4F4F4]'
          >
            <Menu size={24} />
          </motion.button>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.img
                src={shopLogo}
                alt='Outfitory'
                className='h-16'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              />
            )}
          </AnimatePresence>
        </div>

        <nav className='mt-8 flex-grow'>
          {SIDEBAR_ITEMS.map((item) =>
            item.name !== 'Đăng xuất' ? (
              <NavLink
                key={item.href}
                to={item.href}
                end
                className={({ isActive }) =>
                  isActive
                    ? 'mb-2 flex items-center rounded-lg bg-[#F4F4F4] p-4 text-sm font-medium transition-colors'
                    : 'mb-2 flex items-center rounded-lg p-4 text-sm font-medium transition-colors hover:bg-[#F4F4F4]'
                }
              >
                <item.icon size={20} style={{ color: item.color, minWidth: '20px' }} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className='ml-4 whitespace-nowrap'
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ) : (
              <button
                key={item.href}
                className='flex w-full items-center rounded-lg p-4 text-sm font-medium transition-colors hover:bg-[#F4F4F4]'
                onClick={() => setIsOpenModalLogout(true)}
              >
                <item.icon size={20} style={{ color: item.color, minWidth: '20px' }} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className='ml-4 whitespace-nowrap'
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          )}
        </nav>
      </div>
      {isOpenModalLogout && (
        <Modal
          open={isOpenModalLogout}
          onCancel={() => setIsOpenModalLogout(false)}
          footer={null}
          closable={false}
          centered
        >
          <h2 className='text-lg font-semibold'>Bạn có chắc chắn muốn đăng xuất?</h2>
          <div className='mt-4 flex justify-end space-x-2'>
            <Button onClick={() => setIsOpenModalLogout(false)}>Hủy</Button>
            <Button color='danger' variant='solid' onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};
export default AdminSidebar;
