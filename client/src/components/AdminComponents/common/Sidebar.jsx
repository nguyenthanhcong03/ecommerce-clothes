import {
  BarChart2,
  ChartBarStacked,
  DollarSign,
  Menu,
  Settings,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Tag
} from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';

const SIDEBAR_ITEMS = [
  { name: 'Overview', icon: BarChart2, color: '#333', href: '/admin' },
  { name: 'Products', icon: ShoppingBag, color: '#333', href: '/admin/products' },
  { name: 'Categories', icon: ChartBarStacked, color: '#333', href: '/admin/categories' },
  { name: 'Coupons', icon: Tag, color: '#333', href: '/admin/coupons' },
  { name: 'Users', icon: Users, color: '#333', href: '/admin/users' },
  { name: 'Sales', icon: DollarSign, color: '#333', href: '/admin/sales' },
  { name: 'Orders', icon: ShoppingCart, color: '#333', href: '/admin/orders' },
  { name: 'Analytics', icon: TrendingUp, color: '#333', href: '/admin/analytics' },
  { name: 'Settings', icon: Settings, color: '#333', href: '/admin/settings' }
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
