import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { getPaymentMethodText } from '@/utils/helpers/fn';
import { ArrowRight, CheckCircle, Home, Package } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const paymentMethod = searchParams.get('paymentMethod');
  const transactionNo = searchParams.get('transactionNo');

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
        <div className='overflow-hidden rounded-lg bg-white shadow'>
          {/* Header */}
          <div className='bg-green-600 px-6 py-4'>
            <div className='flex items-center'>
              <CheckCircle className='h-8 w-8 text-white' />
              <div className='ml-3'>
                <h1 className='text-lg font-medium text-white'>Thanh toán thành công!</h1>
                <p className='text-green-100'>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='px-6 py-6'>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              {/* Order Info */}
              <div>
                <h3 className='mb-4 text-lg font-medium text-gray-900'>Thông tin đơn hàng</h3>
                <dl className='space-y-3'>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Mã đơn hàng</dt>
                    <dd className='font-mono text-sm text-gray-900'>{orderId}</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Tổng tiền</dt>
                    <dd className='text-sm font-semibold text-gray-900'>{formatCurrency(amount)}</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Phương thức thanh toán</dt>
                    <dd className='text-sm text-gray-900'>{getPaymentMethodText(paymentMethod)}</dd>
                  </div>
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Mã giao dịch</dt>
                    <dd className='font-mono text-sm text-gray-900'>{transactionNo}</dd>
                  </div>
                </dl>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className='mb-4 text-lg font-medium text-gray-900'>Bước tiếp theo</h3>
                <div className='space-y-3'>
                  <div className='flex items-start'>
                    <Package className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>Chuẩn bị đơn hàng</p>
                      <p className='text-sm text-gray-500'>
                        Chúng tôi sẽ chuẩn bị và đóng gói đơn hàng của bạn trong vòng 24h.
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <ArrowRight className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>Vận chuyển</p>
                      <p className='text-sm text-gray-500'>Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-8 flex flex-col gap-4 sm:flex-row'>
              <Button onClick={() => navigate('/user/order')} className='flex-1'>
                Xem đơn hàng của tôi
              </Button>
              <Button onClick={() => navigate('/')} variant='secondary' className='flex-1'>
                <Home className='mr-2 h-4 w-4' />
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className='mt-8 rounded-lg bg-blue-50 p-6'>
          <h3 className='mb-2 text-lg font-medium text-blue-900'>Lưu ý quan trọng</h3>
          <ul className='space-y-1 text-sm text-blue-800'>
            <li>• Email xác nhận đơn hàng đã được gửi đến địa chỉ email của bạn</li>
            <li>• Bạn có thể theo dõi tình trạng đơn hàng trong mục &quot;Đơn hàng của tôi&quot;</li>
            <li>• Liên hệ hotline 1900-xxxx nếu có bất kỳ thắc mắc nào</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
