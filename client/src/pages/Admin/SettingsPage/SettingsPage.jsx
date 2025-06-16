import Header from '@/components/AdminComponents/common/Header';
import DangerZone from '@/components/AdminComponents/settings/DangerZone';
import Profile from '@/components/AdminComponents/settings/Profile';
import Security from '@/components/AdminComponents/settings/Security';

const SettingsPage = () => {
  return (
    <div className='relative z-10 flex-1 overflow-auto bg-gray-900'>
      <Header title='Cài đặt' />
      <main className='mx-auto px-4 py-6 lg:px-8'>
        <Profile />
        <Security />
        <DangerZone />
      </main>
    </div>
  );
};
export default SettingsPage;
