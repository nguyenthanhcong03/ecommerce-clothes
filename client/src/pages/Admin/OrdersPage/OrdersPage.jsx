import AdminHeader from '@/components/AdminComponents/common/AdminHeader';
import useDebounce from '@/hooks/useDebounce';
import OrderTable from '@/pages/admin/OrdersPage/OrderTable';
import { fetchOrders, resetFilter, setFilter, setLimit, setPage } from '@/store/slices/adminOrderSlice';
import { Card, message } from 'antd';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrderFilters from './OrderFilters';
import './OrdersPage.scss';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, pagination, filters, loading, error } = useSelector((state) => state.adminOrder);
  const [searchText, setSearchText] = useState('');

  const debouncedSearchText = useDebounce(searchText, 500);

  const fetchAllOrders = useCallback(() => {
    const queryParams = {
      page: pagination.page || 1,
      limit: pagination.limit || 5,
      search: debouncedSearchText,
      ...filters
    };

    // Loại bỏ các tham số undefined
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
        delete queryParams[key];
      }
    });

    dispatch(fetchOrders(queryParams));
  }, [pagination.page, pagination.limit, filters, debouncedSearchText, dispatch]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handlePageChange = (page, pageSize) => {
    dispatch(setPage(page));
    if (pageSize !== pagination.limit) {
      dispatch(setLimit(pageSize));
    }
  };

  const handleFilterChange = (newFilters) => {
    // Reset về trang 1 khi áp dụng bộ lọc mới
    dispatch(setPage(1));
    dispatch(setFilter(newFilters));
  };

  const handleResetFilter = () => {
    dispatch(setPage(1));
    dispatch(resetFilter());
  };

  const handleRefresh = () => {
    fetchAllOrders();
  };

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  useEffect(() => {
    document.title = 'Đơn hàng | Outfitory';
  }, []);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách đơn hàng: ${error.message}`);
    }
  }, [error]);

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <AdminHeader title='Quản lý đơn hàng' />
      <main className='mx-auto px-4 py-6 lg:px-8'>
        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className='site-card-border-less-wrapper'>
            <Card className='card-shadow'>
              <OrderFilters onFilterChange={handleFilterChange} onResetFilter={handleResetFilter} />
            </Card>
          </div>

          <OrderTable
            searchText={searchText}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default OrdersPage;
