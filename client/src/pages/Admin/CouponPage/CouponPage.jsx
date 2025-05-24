import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, Row, Typography } from 'antd';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CouponFilter from './CouponFilter';
import CouponForm from './CouponForm';
import CouponTable from './CouponTable';

import {
  clearError,
  clearSuccess,
  fetchCoupons,
  resetFilters,
  setFilter,
  setLimit,
  setPage
} from '@/store/slices/couponSlice';
import { Package, PackagePlus, Star, TrendingUp } from 'lucide-react';

const { Title } = Typography;

const CouponPage = () => {
  const dispatch = useDispatch();
  const {
    coupons,
    pagination,
    loading,
    success,
    error,
    message: responseMessage,
    filters
  } = useSelector((state) => state.coupon);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch coupons khi component được mount hoặc pagination/filters thay đổi
  useEffect(() => {
    fetchCouponList();
  }, [pagination.page, pagination.limit, filters]);

  // Xử lý thông báo thành công/lỗi
  useEffect(() => {
    if (success && responseMessage) {
      messageApi.success(responseMessage);
      dispatch(clearSuccess());
      handleCloseForm();
    }

    if (error) {
      messageApi.error(error);
      dispatch(clearError());
    }
  }, [success, error, responseMessage, messageApi, dispatch]);

  const fetchCouponList = () => {
    const params = {
      page: pagination.page || 1,
      limit: pagination.limit || 5,
      ...filters
    };

    // Loại bỏ những giá trị undefined hoặc rỗng
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    dispatch(fetchCoupons(params));
  };

  const handlePageChange = (page, pageSize) => {
    dispatch(setPage(page));
    if (pageSize !== pagination.limit) {
      dispatch(setLimit(pageSize));
    }
  };

  const handleOpenForm = (coupon = null) => {
    setEditCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditCoupon(null);
    setIsFormOpen(false);
  };

  const handleFilterChange = (newFilters) => {
    // Reset về trang 1 khi áp dụng bộ lọc mới
    dispatch(setPage(1));
    dispatch(setFilter(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(setPage(1));
    dispatch(resetFilters());
  };

  const handleRefresh = () => {
    fetchCouponList();
    messageApi.success('Đã làm mới dữ liệu');
  };

  return (
    <>
      {contextHolder}

      <div className='relative z-10 flex-1 overflow-auto'>
        <Header title='Quản lý giảm giá' />

        <main className='mx-auto px-4 py-6 lg:px-8'>
          <motion.div
            className='flex flex-col gap-2'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className='site-card-border-less-wrapper'>
              <Card bordered={false} className='card-shadow'>
                <CouponFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                />
              </Card>
            </div>

            <CouponTable
              coupons={coupons}
              onPageChange={handlePageChange}
              onAdd={handleOpenForm}
              onEdit={handleOpenForm}
              loading={loading}
              onRefresh={handleRefresh}
              pagination={pagination}
            />
          </motion.div>
        </main>
        <CouponForm visible={isFormOpen} onCancel={handleCloseForm} coupon={editCoupon} isEdit={!!editCoupon} />
      </div>
    </>
  );
};

export default CouponPage;
