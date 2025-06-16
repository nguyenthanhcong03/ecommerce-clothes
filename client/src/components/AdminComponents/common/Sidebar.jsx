import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2,
  ChartBarStacked,
  Menu,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const SIDEBAR_ITEMS = [
  { name: 'Tổng quan', icon: BarChart2, color: '#333', href: '/admin' },
  { name: 'Sản phẩm', icon: ShoppingBag, color: '#333', href: '/admin/products' },
  { name: 'Danh mục', icon: ChartBarStacked, color: '#333', href: '/admin/categories' },
  { name: 'Mã giảm giá', icon: Tag, color: '#333', href: '/admin/coupons' },
  { name: 'Người dùng', icon: Users, color: '#333', href: '/admin/users' },
  { name: 'Đơn hàng', icon: ShoppingCart, color: '#333', href: '/admin/orders' },
  { name: 'Thống kê', icon: TrendingUp, color: '#333', href: '/admin/analytics' },
  { name: 'Cài đặt', icon: Settings, color: '#333', href: '/admin/settings' }
];

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <motion.div
      className={`relative z-10 flex-shrink-0 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className='flex h-full flex-col border-r border-[#e1e1e1] bg-white p-4 text-primaryColor backdrop-blur-md'>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className='max-w-fit rounded-full p-2 transition-colors hover:bg-[#F4F4F4]'
        >
          <Menu size={24} />
        </motion.button>

        <nav className='mt-8 flex-grow'>
          {SIDEBAR_ITEMS.map((item) => (
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
          ))}
        </nav>
      </div>
    </motion.div>
  );
};
export default Sidebar;
