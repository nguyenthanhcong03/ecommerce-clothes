import Header from '@/components/AdminComponents/common/Header';
import { Card, message } from 'antd';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CouponFilter from './CouponFilter';
import CouponForm from './CouponForm';
import CouponTable from './CouponTable';

import useDebounce from '@/hooks/useDebounce';
import {
  deleteCoupon,
  fetchCoupons,
  resetFilter,
  setFilter,
  setLimit,
  setPage,
  toggleCouponStatus
} from '@/store/slices/adminCouponSlice';

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
  } = useSelector((state) => state.adminCoupon);

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchText, setSearchText] = useState('');

  const debouncedSearchText = useDebounce(searchText, 500);

  const fetchCouponList = useCallback(() => {
    const params = {
      page: pagination.page || 1,
      limit: pagination.limit || 5,
      search: debouncedSearchText || '',
      ...filters
    };

    // Loại bỏ những giá trị undefined hoặc rỗng
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    dispatch(fetchCoupons(params));
  }, [dispatch, pagination.page, pagination.limit, filters, debouncedSearchText]);

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
    fetchCouponList();
  };

  const handleOpenForm = (product = null) => {
    setSelectedCoupon(product);
    setIsOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedCoupon(null);
    setIsOpenForm(false);
  };

  const handleDeleteCoupon = async (coupon) => {
    try {
      const resultAction = await dispatch(deleteCoupon(coupon._id)).unwrap();
      if (deleteCoupon.fulfilled.match(resultAction)) {
        message.success(`Xóa mã giảm giá ${coupon.code} thành công!`);
        handleRefresh();
      } else if (deleteCoupon.rejected.match(resultAction)) {
        message.error(resultAction?.payload?.message || 'Có lỗi xảy ra khi xóa mã giảm giá');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa mã giảm giá');
      console.error(error);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await dispatch(
        toggleCouponStatus({
          id: coupon._id,
          isActive: !coupon.isActive
        })
      ).unwrap();
      message.success(`Đã ${!coupon.isActive ? 'kích hoạt' : 'vô hiệu hóa'} mã giảm giá ${coupon.code}`);
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra khi thay đổi trạng thái');
    }
  };

  useEffect(() => {
    fetchCouponList();
  }, [fetchCouponList]);

  //   // Xử lý thông báo thành công/lỗi
  // useEffect(() => {
  //   if (success && responseMessage) {
  //     messageApi.success(responseMessage);
  //     dispatch(clearSuccess());
  //     handleCloseForm();
  //   }

  //   if (error) {
  //     messageApi.error(error);
  //     dispatch(clearError());
  //   }
  // }, [success, error, responseMessage, messageApi, dispatch]);

  return (
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
            <Card className='card-shadow'>
              <CouponFilter onFilterChange={handleFilterChange} onResetFilter={handleResetFilter} />
            </Card>
          </div>

          <CouponTable
            searchText={searchText}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
            onAdd={handleOpenForm}
            onEdit={handleOpenForm}
            onDelete={handleDeleteCoupon}
            onToggleStatus={handleToggleStatus}
          />
        </motion.div>
      </main>
      {isOpenForm && <CouponForm isOpenForm={isOpenForm} selectedCoupon={selectedCoupon} onClose={handleCloseForm} />}
    </div>
  );
};

export default CouponPage;
