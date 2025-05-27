import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/format/formatCurrency';
import Button from '../../../components/common/Button/Button';

const PaymentSuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    amount: 0,
    paymentMethod: ''
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId');
    const amount = queryParams.get('amount');
    const paymentMethod = queryParams.get('paymentMethod');

    if (orderId && amount && paymentMethod) {
      setOrderDetails({
        orderId,
        amount: parseFloat(amount),
        paymentMethod
      });
    }

    // You could fetch more order details from your API here
    // For example:
    // if (orderId) {
    //   orderService.getOrderById(orderId)
    //     .then(data => setOrderDetails({...data, amount: parseFloat(amount), paymentMethod}))
    //     .catch(err => console.error('Failed to load order details:', err));
    // }
  }, [location.search]);

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const handleViewOrder = () => {
    // Navigate to order details page
    navigate('/account/orders/' + orderDetails.orderId);
  };

  return (
    <div className='flex min-h-[70vh] items-center justify-center p-8'>
      <div className='w-full max-w-[600px] rounded-lg bg-white p-10 text-center shadow-md'>
        <div className='mb-6 flex justify-center'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#10B981' className='h-16 w-16'>
            <path
              fillRule='evenodd'
              d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z'
              clipRule='evenodd'
            />
          </svg>
        </div>

        <h1 className='mb-4 text-3xl font-bold text-gray-800'>Thanh toán thành công!</h1>
        <p className='mb-8 text-lg text-gray-600'>Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi.</p>

        <div className='mb-6 rounded-md bg-gray-50 p-6'>
          <div className='mb-3 flex justify-between'>
            <span className='font-medium text-gray-500'>Mã đơn hàng:</span>
            <span className='font-semibold text-gray-900'>{orderDetails.orderId}</span>
          </div>
          <div className='mb-3 flex justify-between'>
            <span className='font-medium text-gray-500'>Tổng tiền:</span>
            <span className='font-semibold text-blue-700'>{formatCurrency(orderDetails.amount)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='font-medium text-gray-500'>Phương thức thanh toán:</span>
            <span className='font-semibold text-gray-900'>
              {orderDetails.paymentMethod === 'vnpay'
                ? 'VNPay'
                : orderDetails.paymentMethod === 'momo'
                  ? 'MoMo'
                  : orderDetails.paymentMethod}
            </span>
          </div>
        </div>

        <p className='mb-6 text-sm leading-relaxed text-gray-500'>
          Chúng tôi đã gửi thông tin đặt hàng đến email của bạn. Bạn có thể kiểm tra trạng thái đơn hàng trong trang
          quản lý tài khoản.
        </p>

        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          <Button onClick={handleViewOrder} variant='primary'>
            Xem đơn hàng
          </Button>
          <Button onClick={handleContinueShopping} variant='secondary'>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
