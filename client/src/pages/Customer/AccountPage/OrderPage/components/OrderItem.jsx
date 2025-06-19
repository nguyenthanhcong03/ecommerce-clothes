import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal/Modal';
import CountdownTimer from '@/pages/customer/AccountPage/OrderPage/components/CountdownTimer';
import OrderStatusBadge from '@/pages/customer/AccountPage/OrderPage/components/OrderStatusBadge';
import { createVnpayPaymentAPI } from '@/services/paymentService';
import { formatCurrency } from '@/utils/format/formatCurrency';
import formatDate from '@/utils/format/formatDate';
import { message } from 'antd';
import { ChevronRight, FileEdit, Package } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const OrderItem = ({ order, onCancel }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      message.error('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    onCancel(order._id, cancelReason);
    setShowCancelModal(false);
  };

  const handleOrderExpired = () => {
    message.warning('Đơn hàng đã hết thời gian thanh toán và sẽ bị hủy tự động.');
  };

  const canBeCancelled = ['Unpaid', 'Pending', 'Processing'].includes(order.status);
  const canBeReviewed = order.status === 'Delivered' && !order.isReviewed;

  return (
    <div className='mb-4 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-100 p-4'>
        <div className='flex items-center'>
          <Package className='mr-2 h-5 w-5 text-gray-500' />
          <span className='mr-4 text-sm text-gray-500'>Mã đơn hàng: #{order?._id.substring(0, 8)}</span>
          <OrderStatusBadge status={order?.status} />
          {order?.status === 'Unpaid' && (
            <div className='ml-3'>
              <CountdownTimer createdAt={order?.createdAt} onExpired={handleOrderExpired} />
            </div>
          )}
        </div>
        <div className='flex items-center gap-3'>
          <div className='text-sm text-gray-500'>{formatDate(order?.createdAt)}</div>
          <Link to={`/user/order/detail/${order._id}`}>
            <Button variant='ghost' size='sm' rightIcon={<ChevronRight className='h-4 w-4' />}>
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>
      {/* Sản phẩm */}
      <div className='p-4'>
        {order?.products?.map((item, index) => (
          <div key={index} className='flex items-center border-b border-gray-100 py-2 last:border-b-0'>
            <div className='h-16 w-16 flex-shrink-0'>
              <img
                src={item.snapshot?.image}
                alt={item.snapshot?.name}
                className='h-full w-full rounded-md object-cover'
              />
            </div>
            <div className='ml-4 flex-grow'>
              <h4 className='line-clamp-1 text-sm font-medium'>{item.snapshot?.name}</h4>
              <div className='mt-1 text-xs text-gray-500'>{`Phân loại: ${item.snapshot?.size}, ${item.snapshot?.color}`}</div>
              <div className='mt-1 text-xs text-gray-500'>x{item?.quantity}</div>
            </div>
            <div className='font-medium'>{formatCurrency(item.snapshot?.price)}</div>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className='bg-gray-50 p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <span className='text-gray-600'>Tổng thanh toán:</span>
            <span className='ml-2 text-xl font-medium'>{formatCurrency(order.totalPrice)}</span>
          </div>
          <div className='flex items-center gap-2'>
            {order.status === 'Unpaid' && (
              <Button size='sm' onClick={() => handleCreatePaymentUrl(order._id.toString())}>
                Thanh toán
              </Button>
            )}
            {canBeCancelled && (
              <Button size='sm' variant='danger' onClick={() => setShowCancelModal(true)}>
                Hủy đơn hàng
              </Button>
            )}
            {canBeReviewed && (
              <Link to={`/user/order/review-products/${order._id}`}>
                <Button size='sm' leftIcon={<FileEdit className='h-4 w-4' />}>
                  Đánh giá
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Modal hủy đơn hàng */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title='Hủy đơn hàng'>
        <div>
          <p className='mb-4 text-gray-600'>Bạn có chắc muốn hủy đơn hàng này? Vui lòng cho chúng tôi biết lý do:</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className='w-full flex-1 resize-none border border-gray-300 p-3 px-[10px] text-sm outline-none focus-within:border-primaryColor'
            placeholder='Nhập lý do hủy đơn hàng...'
          ></textarea>
          <div className='mt-4 flex justify-end space-x-2'>
            <Button onClick={() => setShowCancelModal(false)} className='w-[80px]' variant='secondary'>
              Hủy
            </Button>
            <Button onClick={handleCancelOrder} variant='danger' disabled={!cancelReason.trim()}>
              Xác nhận hủy đơn hàng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderItem;
