import { UserCheck, UserPlus, UsersIcon, UserX } from 'lucide-react';
import { motion } from 'framer-motion';

import Header from '@components/AdminComponents/common/Header';
import StatCard from '@components/AdminComponents/common/StatCard';
import UserGrowthChart from '@components/AdminComponents/users/UserGrowthChart';
import UserActivityHeatmap from '@components/AdminComponents/users/UserActivityHeatmap';
import UserDemographicsChart from '@components/AdminComponents/users/UserDemographicsChart';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input } from 'antd';
import CategoryTable from './CategoryTable';

const CategoryPage = () => {
  // const dispatch = useDispatch();
  // const { users, status, error, page, pages, total, isOpenForm, selectedCategory } = useSelector((state) => state.user);
  // console.log(users);

  // useEffect(() => {
  //   dispatch(fetchUsers({ page: 1, limit: 10 }));
  // }, [dispatch]);

  // const handleOpenForm = () => {
  //   dispatch(setIsOpenForm(true));
  //   dispatch(setSelectedUser(null));
  // };

  // if (status === 'loading') {
  //   return <div>Loading...</div>;
  //   // return <Loading />;
  // }

  // if (status === 'failed') {
  //   return <div>Error: {error}</div>;
  // }
  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='Categories' />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Total Users' icon={UsersIcon} value={1} color='#6366F1' />
          <StatCard name='New Users Today' icon={UserPlus} value={1} color='#10B981' />
          <StatCard name='Active Users' icon={UserCheck} value={1} color='#F59E0B' />
          <StatCard name='Churn Rate' icon={UserX} value={1} color='#EF4444' />
        </motion.div>

        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <CategoryTable />
        </motion.div>

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
export default CategoryPage;
