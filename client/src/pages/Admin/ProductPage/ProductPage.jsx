import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import UserActivityHeatmap from '@/components/AdminComponents/users/UserActivityHeatmap';
import UserDemographicsChart from '@/components/AdminComponents/users/UserDemographicsChart';
import UserGrowthChart from '@/components/AdminComponents/users/UserGrowthChart';
import { motion } from 'framer-motion';
import { UserCheck, UserPlus, UsersIcon, UserX } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import ProductTable from './ProductTable';
import Input from '../../../components/common/Input/Input';

const ProductPage = () => {
  const dispatch = useDispatch();
  const { users, status, error, page, pages, total, isOpenForm, selectedCategory } = useSelector(
    (state) => state.product
  );
  // console.log(users);

  // useEffect(() => {
  //   dispatch(fetchUsers({ page: 1, limit: 10 }));
  // }, [dispatch]);

  // const handleOpenForm = () => {
  //   dispatch(setIsOpenForm(true));
  //   dispatch(setSelectedUser(null));
  // };
  // if (status === 'loading') {
  //   return <Loading />;
  // }

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='Products' />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        {/* STATS */}

        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Total Products' icon={UsersIcon} value={total} color='#6366F1' />
          <StatCard name='New Products Today' icon={UserPlus} value={1} color='#10B981' />
          <StatCard name='Active Products' icon={UserCheck} value={1} color='#F59E0B' />
          <StatCard name='Churn Rate' icon={UserX} value={1} color='#EF4444' />
        </motion.div>

        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <ProductTable />
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
export default ProductPage;
