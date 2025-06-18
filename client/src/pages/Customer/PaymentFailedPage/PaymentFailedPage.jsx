import Button from '@/components/common/Button';
import { createVnpayPaymentAPI } from '@/services/paymentService';
import { message } from 'antd';
import { AlertTriangle, ClipboardList, Home, RotateCcw, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');
  const paymentMethod = searchParams.get('paymentMethod');

  const handleCreatePaymentUrl = async (orderId) => {
    try {
      const response = await createVnpayPaymentAPI(orderId);
      if (response && response.paymentUrl) {
        // Chuyển hướng người dùng đến URL thanh toán
        window.location.href = response.paymentUrl;
      }
    } catch (error) {
      console.error('Lỗi khi tạo liên kết thanh toán:', error);
      message.error('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.');
    }
  };

  useEffect(() => {
    // Đơn hàng chưa được tạo nên không cần cancel
    // Chỉ xóa thông tin tạm thời đã được xử lý ở backend
    message.error('Thanh toán thất bại! Vui lòng thử lại.');
  }, []);

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'VNPay':
        return 'VNPay';
      case 'Momo':
        return 'Ví MoMo';
      default:
        return method;
    }
  };

  const getReasonText = (reason) => {
    if (!reason) return 'Lỗi không xác định';

    const decodedReason = decodeURIComponent(reason);

    // Map common error reasons to user-friendly Vietnamese
    const reasonMap = {
      server_error: 'Lỗi hệ thống, vui lòng thử lại sau',
      user_cancelled: 'Bạn đã hủy giao dịch',
      insufficient_balance: 'Số dư tài khoản không đủ',
      card_expired: 'Thẻ đã hết hạn',
      invalid_card: 'Thông tin thẻ không hợp lệ',
      transaction_timeout: 'Giao dịch hết thời gian chờ'
    };

    return reasonMap[reason] || decodedReason;
  };

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
        <div className='overflow-hidden rounded-lg bg-white shadow'>
          {/* Header */}
          <div className='bg-red-600 px-6 py-4'>
            <div className='flex items-center'>
              <XCircle className='h-8 w-8 text-white' />
              <div className='ml-3'>
                <h1 className='text-lg font-medium text-white'>Thanh toán thất bại</h1>
                <p className='text-red-100'>Giao dịch của bạn không thể hoàn tất. Vui lòng thử lại.</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='px-6 py-6'>
            <div className='grid grid-cols-1 gap-6'>
              {/* Error Info */}
              <div className='rounded-lg bg-red-50 p-4'>
                <div className='flex items-start'>
                  <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600' />
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-red-800'>Chi tiết lỗi</h3>
                    <div className='mt-2 text-sm text-red-700'>
                      <p>
                        <strong>Lý do:</strong> {getReasonText(reason)}
                      </p>
                      {paymentMethod && (
                        <p>
                          <strong>Phương thức thanh toán:</strong> {getPaymentMethodText(paymentMethod)}
                        </p>
                      )}{' '}
                      {orderId && (
                        <p>
                          <strong>Mã đơn hàng:</strong> {orderId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* What happened */}
              <div>
                <h3 className='mb-4 text-lg font-medium text-gray-900'>Điều gì đã xảy ra?</h3>
                <div className='prose prose-sm text-gray-600'>
                  <p>
                    Giao dịch thanh toán của bạn không thể được xử lý thành công. Đơn hàng đã được hủy và không có khoản
                    tiền nào bị trừ từ tài khoản của bạn.
                  </p>
                </div>
              </div>

              {/* Next steps */}
              <div>
                <h3 className='mb-4 text-lg font-medium text-gray-900'>Bạn có thể làm gì?</h3>
                <div className='space-y-3'>
                  <div className='flex items-start'>
                    <RotateCcw className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>Thử lại với phương thức thanh toán khác</p>
                      <p className='text-sm text-gray-500'>
                        Quay lại trang thanh toán và chọn phương thức thanh toán khác.
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>Kiểm tra thông tin tài khoản</p>
                      <p className='text-sm text-gray-500'>Đảm bảo số dư đủ và thông tin thanh toán chính xác.</p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <Home className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>Liên hệ hỗ trợ</p>
                      <p className='text-sm text-gray-500'>Nếu vấn đề vẫn tiếp tục, hãy liên hệ với chúng tôi.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-8 flex flex-col gap-4 sm:flex-row'>
              <Button onClick={() => handleCreatePaymentUrl(orderId)} className='flex flex-1'>
                <RotateCcw className='mr-2 h-4 w-4' />
                Thử lại thanh toán
              </Button>
              <Button onClick={() => navigate('/')} className='flex flex-1' variant='secondary'>
                <Home className='mr-2 h-4 w-4' />
                Về trang chủ
              </Button>
              <Button onClick={() => navigate('/user/order')} className='flex flex-1' variant='secondary'>
                <ClipboardList className='mr-2 h-4 w-4' />
                Đơn mua
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
