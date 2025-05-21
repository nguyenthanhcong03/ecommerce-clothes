import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchOrderDetail, resetOrderDetail, cancelOrder } from '@/store/slices/userOrderSlice';
import {
  ArrowLeft,
  Package,
  TruckIcon,
  Loader2,
  MapPin,
  Phone,
  User,
  Clock,
  Calendar,
  FileEdit,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { formatDate } from '@/utils/format/formatDate';
import { Modal } from '@/components/common/Modal';

// Component hiển thị trạng thái đơn hàng
const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return { color: 'bg-amber-100 text-amber-800', icon: <Clock className='h-4 w-4' />, text: 'Chờ xác nhận' };
      case 'Processing':
        return { color: 'bg-blue-100 text-blue-800', icon: <Package className='h-4 w-4' />, text: 'Đang xử lý' };
      case 'Shipping':
        return {
          color: 'bg-indigo-100 text-indigo-800',
          icon: <TruckIcon className='h-4 w-4' />,
          text: 'Đang giao hàng'
        };
      case 'Delivered':
        return { color: 'bg-green-100 text-green-800', icon: <Package className='h-4 w-4' />, text: 'Đã giao hàng' };
      case 'Cancelled':
        return { color: 'bg-red-100 text-red-800', icon: <AlertCircle className='h-4 w-4' />, text: 'Đã hủy' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock className='h-4 w-4' />, text: 'Không xác định' };
    }
  };

  const { color, icon, text } = getStatusConfig();

  return (
    <div className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${color}`}>
      {icon}
      <span className='ml-1.5'>{text}</span>
    </div>
  );
};

// Component hiển thị chi tiết đơn hàng
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderDetail, loading, error } = useSelector((state) => state.userOrder);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Lấy thông tin chi tiết đơn hàng khi component mount
  useEffect(() => {
    dispatch(fetchOrderDetail(orderId));

    // Cleanup khi component unmount
    return () => {
      dispatch(resetOrderDetail());
    };
  }, [dispatch, orderId]);

  // Xử lý hủy đơn hàng
  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    dispatch(cancelOrder({ orderId, reason: cancelReason }))
      .unwrap()
      .then(() => {
        setShowCancelModal(false);
      });
  };

  const canBeCancelled = orderDetail && ['Pending', 'Processing'].includes(orderDetail.status);
  const canBeReviewed = orderDetail && orderDetail.status === 'Delivered' && !orderDetail.isReviewed;

  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <div className='rounded-md bg-red-50 p-4 text-red-600'>{error}</div>
        <button
          onClick={() => navigate('/account/orders')}
          className='mt-4 flex items-center text-orange-500 hover:text-orange-600'
        >
          <ArrowLeft className='mr-1 h-5 w-5' />
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  if (!orderDetail) {
    return null;
  }

  return (
    <div className='container mx-auto p-4'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center'>
          <button
            onClick={() => navigate('/account/orders')}
            className='mr-4 flex items-center text-gray-600 hover:text-orange-500'
          >
            <ArrowLeft className='mr-1 h-5 w-5' />
            Quay lại
          </button>
          <h1 className='text-2xl font-medium'>Chi tiết đơn hàng</h1>
        </div>
        <OrderStatusBadge status={orderDetail.status} />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          {/* Thông tin đơn hàng */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='flex items-center text-lg font-medium'>
                <Package className='mr-2 h-5 w-5 text-orange-500' />
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
                {orderDetail.items.map((item, index) => (
                  <div key={index} className='flex items-center py-2 last:pb-0'>
                    <div className='h-16 w-16 flex-shrink-0'>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className='h-full w-full rounded-md object-cover'
                      />
                    </div>
                    <div className='ml-4 flex-grow'>
                      <h4 className='text-sm font-medium'>{item.product.name}</h4>
                      <div className='mt-1 text-xs text-gray-500'>{item.variant && `Phân loại: ${item.variant}`}</div>
                      <div className='mt-1 text-xs text-gray-500'>x{item.quantity}</div>
                    </div>
                    <div className='font-medium text-orange-500'>{formatCurrency(item.price)}</div>
                  </div>
                ))}
              </div>

              {/* Thông tin thanh toán */}
              <div>
                <h3 className='mb-2 text-sm font-medium text-gray-600'>Chi tiết thanh toán</h3>
                <div className='rounded-md bg-gray-50 p-4'>
                  <div className='flex justify-between py-1'>
                    <span className='text-gray-600'>Tạm tính:</span>
                    <span>{formatCurrency(orderDetail.subtotal || 0)}</span>
                  </div>
                  <div className='flex justify-between py-1'>
                    <span className='text-gray-600'>Phí vận chuyển:</span>
                    <span>{formatCurrency(orderDetail.shippingFee || 0)}</span>
                  </div>
                  {orderDetail.discount > 0 && (
                    <div className='flex justify-between py-1'>
                      <span className='text-gray-600'>Giảm giá:</span>
                      <span>-{formatCurrency(orderDetail.discount || 0)}</span>
                    </div>
                  )}
                  <div className='mt-1 flex justify-between border-t border-gray-200 py-1 pt-2'>
                    <span className='font-medium'>Tổng thanh toán:</span>
                    <span className='text-lg font-medium text-orange-600'>
                      {formatCurrency(orderDetail.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trạng thái đơn hàng */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 flex items-center text-lg font-medium'>
              <Clock className='mr-2 h-5 w-5 text-orange-500' />
              Trạng thái đơn hàng
            </h2>

            <div className='relative'>
              {/* Timeline */}
              <div className='absolute bottom-0 left-3 top-0 w-0.5 bg-gray-200' />

              <div className='space-y-6'>
                {/* Đặt hàng */}
                <div className='relative pl-10'>
                  <div className='absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-orange-500 bg-white'>
                    <div className='h-2 w-2 rounded-full bg-orange-500' />
                  </div>
                  <div>
                    <p className='font-medium'>Đơn hàng đã được đặt</p>
                    <p className='text-sm text-gray-500'>{formatDate(orderDetail.createdAt)}</p>
                  </div>
                </div>

                {/* Xử lý */}
                <div className='relative pl-10'>
                  <div
                    className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                      ['Processing', 'Shipping', 'Delivered'].includes(orderDetail.status)
                        ? 'border-orange-500 bg-white'
                        : 'border-gray-300 bg-white'
                    } flex items-center justify-center`}
                  >
                    {['Processing', 'Shipping', 'Delivered'].includes(orderDetail.status) && (
                      <div className='h-2 w-2 rounded-full bg-orange-500' />
                    )}
                  </div>
                  <div>
                    <p
                      className={
                        ['Processing', 'Shipping', 'Delivered'].includes(orderDetail.status)
                          ? 'font-medium'
                          : 'text-gray-500'
                      }
                    >
                      Đơn hàng đang được xử lý
                    </p>
                    {orderDetail.statusUpdates?.processing && (
                      <p className='text-sm text-gray-500'>{formatDate(orderDetail.statusUpdates.processing)}</p>
                    )}
                  </div>
                </div>

                {/* Giao hàng */}
                <div className='relative pl-10'>
                  <div
                    className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                      ['Shipping', 'Delivered'].includes(orderDetail.status)
                        ? 'border-orange-500 bg-white'
                        : 'border-gray-300 bg-white'
                    } flex items-center justify-center`}
                  >
                    {['Shipping', 'Delivered'].includes(orderDetail.status) && (
                      <div className='h-2 w-2 rounded-full bg-orange-500' />
                    )}
                  </div>
                  <div>
                    <p
                      className={
                        ['Shipping', 'Delivered'].includes(orderDetail.status) ? 'font-medium' : 'text-gray-500'
                      }
                    >
                      Đơn hàng đang được giao
                    </p>
                    {orderDetail.statusUpdates?.shipping && (
                      <p className='text-sm text-gray-500'>{formatDate(orderDetail.statusUpdates.shipping)}</p>
                    )}
                  </div>
                </div>

                {/* Đã giao */}
                <div className='relative pl-10'>
                  <div
                    className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                      orderDetail.status === 'Delivered' ? 'border-orange-500 bg-white' : 'border-gray-300 bg-white'
                    } flex items-center justify-center`}
                  >
                    {orderDetail.status === 'Delivered' && <div className='h-2 w-2 rounded-full bg-orange-500' />}
                  </div>
                  <div>
                    <p className={orderDetail.status === 'Delivered' ? 'font-medium' : 'text-gray-500'}>
                      Đơn hàng đã được giao
                    </p>
                    {orderDetail.statusUpdates?.delivered && (
                      <p className='text-sm text-gray-500'>{formatDate(orderDetail.statusUpdates.delivered)}</p>
                    )}
                  </div>
                </div>

                {/* Đã hủy (nếu có) */}
                {orderDetail.status === 'Cancelled' && (
                  <div className='relative pl-10'>
                    <div className='absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-500 bg-white'>
                      <div className='h-2 w-2 rounded-full bg-red-500' />
                    </div>
                    <div>
                      <p className='font-medium text-red-600'>Đơn hàng đã bị hủy</p>
                      {orderDetail.cancelTime && (
                        <p className='text-sm text-gray-500'>{formatDate(orderDetail.cancelTime)}</p>
                      )}
                      {orderDetail.cancelReason && (
                        <p className='mt-1 text-sm text-gray-500'>Lý do: {orderDetail.cancelReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='lg:col-span-1'>
          {/* Thông tin giao hàng */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 flex items-center text-lg font-medium'>
              <MapPin className='mr-2 h-5 w-5 text-orange-500' />
              Địa chỉ giao hàng
            </h2>

            <div className='space-y-3'>
              <div className='flex items-start'>
                <User className='mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                <div>
                  <p className='font-medium'>{orderDetail.shippingAddress?.fullName}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Phone className='mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                <p>{orderDetail.shippingAddress?.phoneNumber}</p>
              </div>

              <div className='flex items-start'>
                <MapPin className='mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                <p>
                  {orderDetail.shippingAddress?.address}, {orderDetail.shippingAddress?.ward},{' '}
                  {orderDetail.shippingAddress?.district}, {orderDetail.shippingAddress?.province}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 flex items-center text-lg font-medium'>
              <CreditCard className='mr-2 h-5 w-5 text-orange-500' />
              Phương thức thanh toán
            </h2>

            <div className='space-y-2'>
              <p>
                {orderDetail.paymentMethod === 'COD'
                  ? 'Thanh toán khi nhận hàng (COD)'
                  : orderDetail.paymentMethod === 'BANKING'
                    ? 'Chuyển khoản ngân hàng'
                    : orderDetail.paymentMethod === 'STRIPE'
                      ? 'Thẻ tín dụng/Ghi nợ'
                      : orderDetail.paymentMethod}
              </p>

              <div className='mt-2 flex items-center'>
                <span
                  className={`mr-2 inline-block h-3 w-3 rounded-full ${
                    orderDetail.isPaid ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                />
                <span className={orderDetail.isPaid ? 'text-green-700' : 'text-amber-700'}>
                  {orderDetail.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>

              {orderDetail.isPaid && orderDetail.paidAt && (
                <p className='text-sm text-gray-500'>Thanh toán lúc: {formatDate(orderDetail.paidAt)}</p>
              )}
            </div>
          </div>

          {/* Các hành động */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-lg font-medium'>Hành động</h2>

            <div className='space-y-3'>
              {canBeCancelled && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className='w-full rounded-md border border-red-500 px-4 py-2 text-red-500 transition duration-150 hover:bg-red-50'
                >
                  Hủy đơn hàng
                </button>
              )}

              {canBeReviewed && (
                <Link
                  to={`/account/order/review/${orderDetail._id}`}
                  className='inline-flex w-full items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-white transition duration-150 hover:bg-orange-600'
                >
                  <FileEdit className='mr-2 h-4 w-4' />
                  Đánh giá đơn hàng
                </Link>
              )}

              <Link
                to='/account/orders'
                className='inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition duration-150 hover:bg-gray-200'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Quay lại danh sách
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
            className='h-24 w-full rounded-md border p-2 text-sm'
            placeholder='Nhập lý do hủy đơn hàng...'
          ></textarea>
          <div className='mt-4 flex justify-end space-x-2'>
            <button
              onClick={() => setShowCancelModal(false)}
              className='rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50'
            >
              Hủy
            </button>
            <button
              onClick={handleCancelOrder}
              className='rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600'
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

function g({ error, navigate }) {
  return (
    <div className='container mx-auto p-4'>
      <div className='rounded-md bg-red-50 p-4 text-red-600'>{error}</div>
      <button
        onClick={() => navigate('/account/orders')}
        className='mt-4 flex items-center text-orange-500 hover:text-orange-600'
      >
        <ArrowLeft className='mr-1 h-5 w-5' />
        Quay lại danh sách đơn hàng
      </button>
    </div>
  );
}
