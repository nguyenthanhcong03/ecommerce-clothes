import { motion } from 'framer-motion';

import Header from '@components/AdminComponents/common/Header';
import StatCard from '@components/AdminComponents/common/StatCard';
import { CreditCard, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import SalesOverviewChart from '@components/AdminComponents/sales/SalesOverviewChart';
import SalesByCategoryChart from '@components/AdminComponents/sales/SalesByCategoryChart';
import DailySalesTrend from '@components/AdminComponents/sales/DailySalesTrend';

const salesStats = {
  totalRevenue: '$1,234,567',
  averageOrderValue: '$78.90',
  conversionRate: '3.45%',
  salesGrowth: '12.3%'
};

const SalesPage = () => {
  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='Sales Dashboard' />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        {/* SALES STATS */}
        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Total Revenue' icon={DollarSign} value={salesStats.totalRevenue} color='#6366F1' />
          <StatCard name='Avg. Order Value' icon={ShoppingCart} value={salesStats.averageOrderValue} color='#10B981' />
          <StatCard name='Conversion Rate' icon={TrendingUp} value={salesStats.conversionRate} color='#F59E0B' />
          <StatCard name='Sales Growth' icon={CreditCard} value={salesStats.salesGrowth} color='#EF4444' />
        </motion.div>

        <SalesOverviewChart />

        <div className='mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <SalesByCategoryChart />
          <DailySalesTrend />
        </div>
      </main>
    </div>
  );
};
export default SalesPage;
