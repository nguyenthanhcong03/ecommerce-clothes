import AIPoweredInsights from '@/components/AdminComponents/analytics/AIPoweredInsights';
import ChannelPerformance from '@/components/AdminComponents/analytics/ChannelPerformance';
import CustomerSegmentation from '@/components/AdminComponents/analytics/CustomerSegmentation';
import OverviewCards from '@/components/AdminComponents/analytics/OverviewCards';
import ProductPerformance from '@/components/AdminComponents/analytics/ProductPerformance';
import RevenueChart from '@/components/AdminComponents/analytics/RevenueChart';
import UserRetention from '@/components/AdminComponents/analytics/UserRetention';
import Header from '@/components/AdminComponents/common/Header';

const AnalyticsPage = () => {
  return (
    <div className='relative z-10 flex-1 overflow-auto bg-gray-900'>
      <Header title={'Analytics Dashboard'} />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        <OverviewCards />
        <RevenueChart />

        <div className='mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <ChannelPerformance />
          <ProductPerformance />
          <UserRetention />
          <CustomerSegmentation />
        </div>

        <AIPoweredInsights />
      </main>
    </div>
  );
};
export default AnalyticsPage;
