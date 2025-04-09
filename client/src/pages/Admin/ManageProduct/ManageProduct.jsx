import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../../redux/features/product/productSlice';
import Loading from '@components/Loading/Loading';
import StatCard from '@components/AdminComponents/common/StatCard';
import ProductsTable from '@components/AdminComponents/products/ProductsTable';
// import CardTable from '@components/AdminComponents/Cards/CardTable.jsx';
import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';
import SalesTrendChart from '../../../components/AdminComponents/products/SalesTrendChart';
import CategoryDistributionChart from '../../../components/AdminComponents/overview/CategoryDistributionChart';
import ProductTable from '../ProductPage/ProductTable';
import Header from '@components/AdminComponents/common/Header';

const ManageProduct = () => {
  const dispatch = useDispatch();
  const { products, status, error, page, pages } = useSelector((state) => state.product);
  console.log(products);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);

  if (status === 'loading') {
    // return <div>Loading...</div>;
    return <Loading />;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='z-10 flex-1 overflow-auto'>
      <Header title='Products' />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Total Products' icon={Package} value={1234} color='#6366F1' />
          <StatCard name='Top Selling' icon={TrendingUp} value={89} color='#10B981' />
          <StatCard name='Low Stock' icon={AlertTriangle} value={23} color='#F59E0B' />
          <StatCard name='Total Revenue' icon={DollarSign} value={'$543,210'} color='#EF4444' />
        </motion.div>

        {/* <ProductsTable /> */}
        <ProductTable products={products} />

        {/* CHARTS */}
        <div className='grid-col-1 grid gap-8 lg:grid-cols-2'>
          <SalesTrendChart />
          <CategoryDistributionChart />
        </div>
      </main>
    </div>
  );
};

export default ManageProduct;
