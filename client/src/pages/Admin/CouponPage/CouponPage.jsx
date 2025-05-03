import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Typography, Spin, Row, Col, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import { motion } from 'framer-motion';

import CouponTable from './CouponTable';
import CouponForm from './CouponForm';
import CouponFilter from './CouponFilter';

import {
  fetchCoupons,
  setPage,
  setLimit,
  clearSuccess,
  clearError,
  setFilter,
  resetFilters
} from '../../../redux/features/coupon/couponSlice';
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
      page: pagination.page,
      limit: pagination.limit,
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
        <Header title='Products' />

        <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
          {/* STATS */}
          <motion.div
            className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard name='Tổng số sản phẩm' icon={Package} value={0} color='#6366F1' />
            <StatCard name='Sản phẩm mới hôm nay' icon={PackagePlus} value={0} color='#10B981' />
            <StatCard name='Sản phẩm đang hoạt động' icon={TrendingUp} value={0} color='#F59E0B' />
            <StatCard name='Sản phẩm nổi bật' icon={Star} value={0} color='#EF4444' />
          </motion.div>

          <motion.div
            className='flex flex-col gap-2'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className='site-card-border-less-wrapper'>
              <Card bordered={false} className='card-shadow'>
                <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
                  <Col>
                    <Button type='primary' icon={<PlusOutlined />} onClick={() => handleOpenForm()}>
                      Thêm mã giảm giá
                    </Button>
                  </Col>
                </Row>

                <CouponFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                />
              </Card>

              <CouponForm visible={isFormOpen} onCancel={handleCloseForm} coupon={editCoupon} isEdit={!!editCoupon} />
            </div>
            <CouponTable
              coupons={coupons}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                onChange: handlePageChange,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 20, 50],
                showTotal: (total) => `Tổng ${total} mã giảm giá`
              }}
              onEdit={handleOpenForm}
              loading={loading}
              onRefresh={handleRefresh}
            />
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default CouponPage;
