import { motion } from 'framer-motion';
import { CheckCircle, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import DailyOrders from '@/components/AdminComponents/orders/DailyOrders';
import OrderDistribution from '@/components/AdminComponents/orders/OrderDistribution';
import OrdersTable from '@/components/AdminComponents/orders/OrdersTable';

const orderStats = {
  totalOrders: '1,234',
  pendingOrders: '56',
  completedOrders: '1,178',
  totalRevenue: '$98,765'
};

const OrdersPage = () => {
  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title={'Orders'} />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Total Orders' icon={ShoppingBag} value={orderStats.totalOrders} color='#6366F1' />
          <StatCard name='Pending Orders' icon={Clock} value={orderStats.pendingOrders} color='#F59E0B' />
          <StatCard name='Completed Orders' icon={CheckCircle} value={orderStats.completedOrders} color='#10B981' />
          <StatCard name='Total Revenue' icon={DollarSign} value={orderStats.totalRevenue} color='#EF4444' />
        </motion.div>

        <div className='mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <DailyOrders />
          <OrderDistribution />
        </div>

        <OrdersTable />
      </main>
    </div>
  );
};
export default OrdersPage;
