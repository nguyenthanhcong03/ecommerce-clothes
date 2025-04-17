import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import UserActivityHeatmap from '@/components/AdminComponents/users/UserActivityHeatmap';
import UserDemographicsChart from '@/components/AdminComponents/users/UserDemographicsChart';
import UserGrowthChart from '@/components/AdminComponents/users/UserGrowthChart';
import { fetchUsers, setIsOpenForm, setSelectedUser } from '@/redux/features/user/userSlice';
import { Button, Input } from 'antd';
import { motion } from 'framer-motion';
import { UserCheck, UserPlus, UsersIcon, UserX } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddUserForm from './AddUserForm';
import UserTable from './UserTable';

const userStats = {
  totalUsers: 152845,
  newUsersToday: 243,
  activeUsers: 98520,
  churnRate: '2.4%'
};

const UsersPage = () => {
  const dispatch = useDispatch();
  const { users, status, error, page, pages, total, isOpenForm, selectedUser } = useSelector((state) => state.user);
  console.log(users);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleOpenForm = () => {
    dispatch(setIsOpenForm(true));
    dispatch(setSelectedUser(null));
  };

  // if (status === 'loading') {
  //   return <div>Loading...</div>;
  //   // return <Loading />;
  // }

  // if (status === 'failed') {
  //   return <div>Error: {error}</div>;
  // }
  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='Users' />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Total Users' icon={UsersIcon} value={total} color='#6366F1' />
          <StatCard name='New Users Today' icon={UserPlus} value={total} color='#10B981' />
          <StatCard
            name='Active Users'
            icon={UserCheck}
            value={userStats.activeUsers.toLocaleString()}
            color='#F59E0B'
          />
          <StatCard name='Churn Rate' icon={UserX} value={userStats.churnRate} color='#EF4444' />
        </motion.div>

        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between gap-5'>
            <Input placeholder='Tìm kiếm' />

            <Button type='primary' onClick={handleOpenForm}>
              Thêm mới
            </Button>
          </div>

          {/* <UsersTable /> */}
          <UserTable users={users} />
        </div>
        {isOpenForm && <AddUserForm />}

        {/* USER CHARTS */}
        <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <UserGrowthChart />
          <UserActivityHeatmap />
          <UserDemographicsChart />
        </div>
      </main>
    </div>
  );
};
export default UsersPage;
