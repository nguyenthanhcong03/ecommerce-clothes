import CardLineChart from '@components/AdminComponents/Cards/CardLineChart.jsx';
import CardBarChart from '@components/AdminComponents/Cards/CardBarChart.jsx';
import CardPageVisits from '@components/AdminComponents/Cards/CardPageVisits.jsx';
import CardSocialTraffic from '@components/AdminComponents/Cards/CardSocialTraffic.jsx';
const Dashboard = () => {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='mb-12 w-full px-4 xl:mb-0 xl:w-8/12'>
          <CardLineChart />
        </div>
        <div className='w-full px-4 xl:w-4/12'>
          <CardBarChart />
        </div>
      </div>
      <div className='mt-4 flex flex-wrap'>
        <div className='mb-12 w-full px-4 xl:mb-0 xl:w-8/12'>
          <CardPageVisits />
        </div>
        <div className='w-full px-4 xl:w-4/12'>
          <CardSocialTraffic />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
