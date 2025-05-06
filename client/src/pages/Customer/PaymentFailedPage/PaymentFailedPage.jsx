import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button/Button';

const PaymentFailedPage = () => {
  const [errorDetails, setErrorDetails] = useState({
    orderId: '',
    reason: '',
    paymentMethod: ''
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId');
    const reason = queryParams.get('reason');
    const paymentMethod = queryParams.get('paymentMethod');

    setErrorDetails({
      orderId: orderId || 'Unknown',
      reason: reason || 'Giao dịch không thành công',
      paymentMethod: paymentMethod || 'Unknown'
    });
  }, [location.search]);

  const handleTryAgain = () => {
    // Redirect to checkout or payment selection page
    // You may want to persist cart/order information
    navigate('/checkout');
  };

  const handleContactSupport = () => {
    // Redirect to contact page
    navigate('/contact');
  };

  const getReadablePaymentMethod = (method) => {
    switch (method) {
      case 'vnpay':
        return 'VNPay';
      case 'momo':
        return 'MoMo';
      default:
        return method;
    }
  };

  const getErrorMessage = (reason) => {
    // Map error codes to user-friendly messages
    switch (reason) {
      case 'invalid_signature':
        return 'Chữ ký không hợp lệ. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.';
      case 'server_error':
        return 'Đã có lỗi xảy ra từ máy chủ. Vui lòng thử lại sau.';
      case 'Số dư tài khoản không đủ':
        return 'Số dư tài khoản không đủ để thực hiện giao dịch.';
      case 'Khách hàng hủy giao dịch':
        return 'Giao dịch đã bị hủy bởi người dùng.';
      default:
        return reason || 'Đã có lỗi xảy ra trong quá trình thanh toán.';
    }
  };

  return (
    <div className='flex min-h-[70vh] items-center justify-center p-8'>
      <div className='w-full max-w-[600px] rounded-lg bg-white p-10 text-center shadow-md'>
        <div className='mb-6 flex justify-center'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#EF4444' className='h-16 w-16'>
            <path
              fillRule='evenodd'
              d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z'
              clipRule='evenodd'
            />
          </svg>
        </div>

        <h1 className='mb-4 text-3xl font-bold text-gray-800'>Thanh toán thất bại</h1>
        <p className='mb-8 text-lg text-gray-600'>{getErrorMessage(errorDetails.reason)}</p>

        <div className='mb-6 rounded-md bg-gray-50 p-6'>
          {errorDetails.orderId && errorDetails.orderId !== 'Unknown' && (
            <div className='mb-3 flex justify-between'>
              <span className='font-medium text-gray-500'>Mã đơn hàng:</span>
              <span className='font-semibold text-gray-900'>{errorDetails.orderId}</span>
            </div>
          )}
          {errorDetails.paymentMethod && errorDetails.paymentMethod !== 'Unknown' && (
            <div className='flex justify-between'>
              <span className='font-medium text-gray-500'>Phương thức thanh toán:</span>
              <span className='font-semibold text-gray-900'>
                {getReadablePaymentMethod(errorDetails.paymentMethod)}
              </span>
            </div>
          )}
        </div>

        <div className='mb-8 text-left'>
          <h3 className='mb-3 text-base font-semibold text-gray-700'>Bạn có thể làm gì?</h3>
          <ul className='list-disc space-y-2 pl-6 text-gray-600'>
            <li>Kiểm tra thông tin thanh toán và thử lại</li>
            <li>Chọn phương thức thanh toán khác</li>
            <li>Liên hệ với ngân hàng của bạn nếu giao dịch bị từ chối</li>
            <li>Liên hệ với bộ phận hỗ trợ của chúng tôi nếu bạn cần trợ giúp</li>
          </ul>
        </div>

        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          <Button onClick={handleTryAgain} variant='primary'>
            Thử lại
          </Button>
          <Button onClick={handleContactSupport} variant='outline'>
            Liên hệ hỗ trợ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
