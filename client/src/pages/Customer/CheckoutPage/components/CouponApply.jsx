import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { calculateDiscount, validateCouponAPI } from '@/services/couponService';
import { setCoupon, setCouponDiscount } from '@/store/slices/orderSlice';
import { CloseOutlined, TagOutlined } from '@ant-design/icons';
import { Alert, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const CouponApply = () => {
  const { orderItems, coupon } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      // Tính tổng tiền hiện tại để kiểm tra điều kiện áp dụng coupon
      const subtotal = orderItems.reduce((total, item) => {
        const price = item.snapshot.price || item.snapshot.originalPrice;
        return total + price * item.quantity;
      }, 0);

      const response = await validateCouponAPI(couponCode, subtotal);

      if (response) {
        const couponData = response;
        dispatch(setCoupon(couponData));

        // Tính toán giảm giá
        const discountCalculation = calculateDiscount(couponData, subtotal);
        console.log('first discountCalculation', discountCalculation);
        dispatch(setCouponDiscount(discountCalculation));

        message.success(`Đã áp dụng mã giảm giá: ${couponData.code}`);
      } else {
        setCouponError(response?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error?.response?.data?.message || 'Đã xảy ra lỗi khi áp dụng mã giảm giá.');
    } finally {
      setCouponLoading(false);
    }
  };

  // Xử lý xóa mã giảm giá đã áp dụng
  const handleRemoveCoupon = () => {
    dispatch(setCoupon(null));
    dispatch(setCouponDiscount(0));
    setCouponCode('');
    setCouponError('');
    message.success('Đã bỏ áp dụng mã giảm giá');
  };

  // Tục xóa thông báo lỗi coupon sau 3 giây
  useEffect(() => {
    let timer;
    if (couponError) {
      timer = setTimeout(() => {
        if (typeof setCouponError === 'function') {
          setCouponError('');
        }
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [couponError, setCouponError]);

  return (
    <div className='rounded-sm bg-white p-6'>
      <div className='flex items-center gap-2'>
        <TagOutlined className='text-blue-600' />
        <h3 className='font-medium'>Mã giảm giá</h3>
      </div>

      <div className='mt-3'>
        <div className='w-full'>
          <div className='flex items-center gap-1'>
            <div className='flex-1'>
              <Input
                type='text'
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder='Nhập mã giảm giá'
                className='h-[38px]'
                disabled={couponLoading || !!coupon}
              />
            </div>
            {coupon ? (
              <Button
                type='button'
                onClick={handleRemoveCoupon}
                className='bg-red-500 hover:bg-red-600'
                disabled={couponLoading}
              >
                {couponLoading ? (
                  <Spin size='small' />
                ) : (
                  <>
                    <CloseOutlined />
                    Xóa
                  </>
                )}
              </Button>
            ) : (
              <Button type='button' onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}>
                {couponLoading ? <Spin size='small' /> : 'Áp dụng'}
              </Button>
            )}
          </div>
          {couponError && (
            <div className='mt-2'>
              <Alert message={couponError} type='error' showIcon />
            </div>
          )}
          {coupon && (
            <div className='mt-2'>
              <Alert
                message={`Đã áp dụng mã giảm giá: ${coupon.code}`}
                description={coupon.description}
                type='success'
                showIcon
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponApply;
