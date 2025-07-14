import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal/Modal2';
import CountdownTimer from '@/pages/customer/AccountPage/OrderPage/components/CountdownTimer';
import OrderStatusBadge from '@/pages/customer/AccountPage/OrderPage/components/OrderStatusBadge';
import OrderTimeline from '@/pages/customer/AccountPage/OrderPage/components/OrderTimeline';
import { createVnpayPaymentAPI, vnpayRefundAPI } from '@/services/paymentService';
import { cancelOrder, fetchOrderDetail, resetOrderDetail } from '@/store/slices/userOrderSlice';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { formatDate } from '@/utils/format/formatDate';
import { message } from 'antd';
import { ArrowLeft, Calendar, CreditCard, FileEdit, Loader2, MapPin, Package, Phone, Timer, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderDetail, loading, error } = useSelector((state) => state.userOrder);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  console.log('orderDetail', orderDetail);

  // Xử lý tạo URL thanh toán
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

  // Xử lý khi đơn hàng hết hạn thanh toán
  const handleOrderExpired = () => {
    message.warning('Đơn hàng đã hết thời gian thanh toán và sẽ bị hủy tự động.');
  };

  // Lấy thông tin chi tiết đơn hàng khi component mount
  useEffect(() => {
    dispatch(fetchOrderDetail(orderId));

    // Cleanup khi component unmount
    return () => {
      dispatch(resetOrderDetail());
    };
  }, [dispatch, orderId]);

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      message.error('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    try {
      // Gọi API hủy đơn hàng
      await dispatch(cancelOrder({ orderId, reason: cancelReason })).unwrap();
      message.success('Đơn hàng đã được hủy thành công và đang hoàn tiền');

      // Gọi API hoàn tiền sau khi hủy đơn hàng thành công
      try {
        await vnpayRefundAPI(orderId, cancelReason);
        message.success('Đơn hàng đã được hủy và hoàn tiền thành công');

        // Reload lại chi tiết đơn hàng
        dispatch(fetchOrderDetail(orderId));
      } catch (refundError) {
        message.error('Đơn hàng đã được hủy nhưng không thể hoàn tiền. Vui lòng liên hệ hỗ trợ.');
      }

      setShowCancelModal(false);
    } catch (error) {
      message.error('Lỗi khi hủy đơn hàng');
    }
  };

  const canBeCancelled = orderDetail && ['Pending', 'Processing'].includes(orderDetail.status);
  const canBeReviewed = orderDetail && orderDetail.status === 'Delivered' && !orderDetail.isReviewed;

  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primaryColor' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <div className='rounded-sm bg-red-50 p-4 text-red-600'>{error}</div>
        <Button
          variant='ghost'
          onClick={() => navigate('/user/order')}
          className='mt-4 flex items-center text-neutral-600 hover:text-neutral-900'
        >
          <ArrowLeft className='mr-1 h-5 w-5' />
          Quay lại danh sách đơn hàng
        </Button>
      </div>
    );
  }

  if (!orderDetail) {
    return null;
  }

  return (
    <div className='container mx-auto p-4'>
      {' '}
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            onClick={() => navigate('/user/order')}
            className='text-neutral-600 hover:text-neutral-900'
          >
            <ArrowLeft className='mr-1 h-5 w-5' />
            Quay lại
          </Button>
          <h1 className='text-2xl font-medium'>Chi tiết đơn hàng</h1>
        </div>
        <div className='flex items-center gap-3'>
          <OrderStatusBadge status={orderDetail.status} />
          {orderDetail.payment?.status === 'Unpaid' && (
            <CountdownTimer createdAt={orderDetail.createdAt} onExpired={handleOrderExpired} />
          )}
        </div>
      </div>
      {/* Thông báo cảnh báo cho đơn hàng chưa thanh toán */}
      {orderDetail?.payment?.status === 'Unpaid' && (
        <div className='mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4'>
          <div className='flex items-start'>
            <Timer className='mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600' />
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-orange-800'>Lưu ý về thời gian thanh toán</h3>
              <div className='mt-2 text-sm text-orange-700'>
                <p>
                  Đơn hàng chưa thanh toán chỉ tồn tại trong <strong>1 ngày</strong> kể từ khi tạo đơn. Sau thời gian
                  này, đơn hàng sẽ tự động bị hủy.
                </p>
                <p className='mt-1'>
                  Vui lòng hoàn tất thanh toán trước khi hết thời gian để đảm bảo đơn hàng của bạn được xử lý.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          {/* Thông tin đơn hàng */}
          <div className='mb-6 rounded-sm border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='flex items-center text-lg font-medium'>
                <Package className='mr-2 h-5 w-5 text-blue-500' />
                Đơn hàng #{orderDetail._id.substring(0, 8)}
              </h2>
              <div className='flex items-center text-sm text-gray-500'>
                <Calendar className='mr-1 h-4 w-4' />
                {formatDate(orderDetail.createdAt)}
              </div>
            </div>

            <div className='space-y-4'>
              {/* Sản phẩm */}
              <div className='border-b border-gray-200 pb-4'>
                <h3 className='mb-2 text-sm font-medium text-gray-600'>Sản phẩm</h3>
                {orderDetail?.products.map((item, index) => (
                  <div key={index} className='flex items-center py-2 last:pb-0'>
                    <div className='h-16 w-16 flex-shrink-0'>
                      <img
                        src={item?.snapshot?.image}
                        alt={item?.snapshot?.name}
                        className='h-full w-full rounded-sm object-cover'
                      />
                    </div>
                    <div className='ml-4 flex-grow'>
                      <h4 className='text-sm font-medium'>{item?.snapshot?.name}</h4>
                      <div className='mt-1 text-xs text-gray-500'>
                        {item?.snapshot && `Phân loại: ${item?.snapshot?.color}, ${item?.snapshot?.size}`}
                      </div>
                      <div className='mt-1 text-xs text-gray-500'>x{item?.quantity}</div>
                    </div>
                    <div className='font-medium'>{formatCurrency(item?.snapshot?.price)}</div>
                  </div>
                ))}
              </div>

              {/* Thông tin thanh toán */}
              <div>
                <h3 className='mb-2 text-sm font-medium text-gray-600'>Chi tiết thanh toán</h3>
                <div className='rounded-sm bg-gray-50 p-4'>
                  <div className='flex justify-between py-1'>
                    <span className='text-gray-600'>Tạm tính:</span>
                    <span>{formatCurrency(orderDetail?.totalPrice + orderDetail?.discountAmount || 0)}</span>
                  </div>
                  <div className='flex justify-between py-1'>
                    <span className='text-gray-600'>Phí vận chuyển:</span>
                    <span>{formatCurrency(orderDetail.shippingFee || 0)}</span>
                  </div>
                  {orderDetail.discountAmount > 0 && (
                    <div className='flex justify-between py-1'>
                      <span className='text-gray-600'>Giảm giá:</span>
                      <span>-{formatCurrency(orderDetail.discountAmount || 0)}</span>
                    </div>
                  )}
                  <div className='mt-1 flex justify-between border-t border-gray-200 py-1 pt-2'>
                    <span className='font-medium'>Tổng thanh toán:</span>
                    <span className='text-lg font-medium text-red-600'>{formatCurrency(orderDetail.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trạng thái đơn hàng */}
          {/* <OrderTimeline orderDetail={orderDetail} /> */}
        </div>

        {/* Sidebar */}
        <div className='lg:col-span-1'>
          {/* Thông tin giao hàng */}
          <div className='mb-6 rounded-sm border border-gray-200 bg-white p-4 shadow-sm'>
            <h2 className='mb-4 flex items-center text-lg font-medium'>
              {/* <MapPin className='mr-2 h-5 w-5 text-blue-500' /> */}
              Địa chỉ giao hàng
            </h2>

            <div className='space-y-3 text-sm text-gray-600'>
              <div className='flex items-start'>
                <User className='mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                <div>
                  <p className='font-medium'>{orderDetail?.shippingAddress?.fullName}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Phone className='mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                <p>{orderDetail?.shippingAddress?.phoneNumber}</p>
              </div>

              <div className='flex items-start'>
                <MapPin className='mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                <p>
                  {orderDetail?.shippingAddress?.street}, {orderDetail?.shippingAddress?.ward?.name},{' '}
                  {orderDetail?.shippingAddress?.district?.name}, {orderDetail?.shippingAddress?.province?.name}
                </p>
              </div>
            </div>
          </div>
          {/* Thông tin thanh toán */}
          <div className='mb-6 rounded-sm border border-gray-200 bg-white p-4 shadow-sm'>
            <h2 className='mb-4 flex items-center text-lg font-medium'>Phương thức thanh toán</h2>

            <div className='space-y-2'>
              <p>
                {orderDetail?.payment?.method === 'COD'
                  ? 'Thanh toán khi nhận hàng (COD)'
                  : orderDetail?.payment?.method === 'VNPay'
                    ? 'Thanh toán qua VNPay'
                    : 'Khác'}
              </p>

              <div className='mt-2 flex items-center'>
                <span
                  className={`mr-2 inline-block h-3 w-3 rounded-full ${
                    orderDetail?.payment?.status === 'Paid'
                      ? 'bg-green-500'
                      : orderDetail?.payment?.status === 'Refunded'
                        ? 'bg-purple-500'
                        : 'bg-amber-500'
                  }`}
                />
                <span
                  className={
                    orderDetail?.payment?.status === 'Paid'
                      ? 'text-green-700'
                      : orderDetail?.payment?.status === 'Refunded'
                        ? 'text-purple-700'
                        : 'text-amber-700'
                  }
                >
                  {orderDetail?.payment?.status === 'Paid'
                    ? 'Đã thanh toán'
                    : orderDetail?.payment?.status === 'Refunded'
                      ? 'Đã hoàn tiền'
                      : 'Chưa thanh toán'}
                </span>
              </div>

              {orderDetail?.payment?.status === 'Paid' && orderDetail?.payment?.paidAt && (
                <p className='text-sm text-gray-500'>Thanh toán lúc: {formatDate(orderDetail?.payment?.paidAt)}</p>
              )}

              {orderDetail?.payment?.status === 'Refunded' && orderDetail?.payment?.refundedAt && (
                <p className='text-sm text-gray-500'>Hoàn tiền lúc: {formatDate(orderDetail?.payment?.refundedAt)}</p>
              )}
            </div>
          </div>
          {/* Các hành động */}
          <div className='rounded-sm border border-gray-200 bg-white p-4 shadow-sm'>
            <h2 className='mb-4 text-lg font-medium'>Hành động</h2>

            <div className='flex flex-col space-y-3'>
              {orderDetail?.payment?.status === 'Unpaid' && (
                <Button onClick={() => handleCreatePaymentUrl(orderDetail._id.toString())}>
                  <CreditCard className='mr-2 h-4 w-4' />
                  Thanh toán ngay
                </Button>
              )}

              {canBeCancelled && (
                <Button variant='danger' onClick={() => setShowCancelModal(true)}>
                  Hủy đơn hàng
                </Button>
              )}

              {canBeReviewed && (
                <Link to={`/user/order/review-products/${orderDetail._id}`}>
                  <Button className='w-full'>
                    <FileEdit className='mr-2 h-4 w-4' />
                    Đánh giá sản phẩm
                  </Button>
                </Link>
              )}

              <Link to='/user/order'>
                <Button variant='secondary' className='w-full'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Quay lại
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Modal hủy đơn hàng */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title='Hủy đơn hàng'>
        <div className='p-4'>
          <p className='mb-4 text-gray-600'>Bạn có chắc muốn hủy đơn hàng này? Vui lòng cho chúng tôi biết lý do:</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className='h-24 w-full rounded-sm border p-2 text-sm'
            placeholder='Nhập lý do hủy đơn hàng...'
          ></textarea>
          <div className='mt-4 flex justify-end space-x-2'>
            <button
              onClick={() => setShowCancelModal(false)}
              className='rounded-sm border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50'
            >
              Hủy
            </button>
            <button
              onClick={handleCancelOrder}
              className='rounded-sm bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600'
            >
              Xác nhận hủy đơn hàng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;

// function g({ error, navigate }) {
//   return (
//     <div className='container mx-auto p-4'>
//       <div className='rounded-sm bg-red-50 p-4 text-red-600'>{error}</div>
//       <Button
//         variant='ghost'
//         onClick={() => navigate('/user/order')}
//         className='mt-4 text-neutral-600 hover:text-neutral-900'
//       >
//         <ArrowLeft className='mr-1 h-5 w-5' />
//         Quay lại danh sách đơn hàng
//       </Button>
//     </div>
//   );
// }
