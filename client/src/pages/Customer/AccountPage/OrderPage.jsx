import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserOrders, setActiveTab, cancelOrder } from '@/store/slices/userOrderSlice';
import {
  Package,
  TruckIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  FileEdit,
  Search,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'react-toastify';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';

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
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className='h-4 w-4' />,
          text: 'Đã giao hàng'
        };
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

// Component hiển thị một đơn hàng
const OrderItem = ({ order, onCancel }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    onCancel(order._id, cancelReason);
    setShowCancelModal(false);
  };

  const canBeCancelled = ['Pending', 'Processing'].includes(order.status);
  const canBeReviewed = order.status === 'Delivered' && !order.isReviewed;

  return (
    <div className='mb-4 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-100 p-4'>
        <div className='flex items-center'>
          <Package className='mr-2 h-5 w-5 text-gray-500' />
          <span className='mr-4 text-sm text-gray-500'>Mã đơn hàng: #{order._id.substring(0, 8)}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className='text-sm text-gray-500'>{formatDate(order.createdAt)}</div>
      </div>

      {/* Sản phẩm */}
      <div className='p-4'>
        {order.products?.map((item, index) => (
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
              <div className='mt-1 text-xs text-gray-500'>{`Phân loại: ${item.snapshot.size}, ${item.snapshot.color}`}</div>
              <div className='mt-1 text-xs text-gray-500'>x{item.quantity}</div>
            </div>
            <div className='font-medium'>{formatCurrency(item.snapshot.price)}</div>
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
            {canBeCancelled && (
              <Button onClick={() => setShowCancelModal(true)} variant='secondary' className='rounded-md'>
                Hủy đơn hàng
              </Button>
            )}
            {canBeReviewed && (
              <Link to={`/user/orders/review/${order._id}`}>
                <Button leftIcon={<FileEdit className='h-4 w-4' />} className='rounded-md'>
                  Đánh giá
                </Button>
              </Link>
            )}
            <Link to={`/user/orders/detail/${order._id}`}>
              <Button variant='ghost' rightIcon={<ChevronRight className='h-4 w-4' />} className='rounded-md'>
                Xem chi tiết
              </Button>
            </Link>
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

const OrderPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, totalOrders, totalPages, currentPage, activeTab } = useSelector(
    (state) => state.userOrder
  );
  const [searchKeyword, setSearchKeyword] = useState('');

  // Danh sách tabs
  const tabs = [
    { id: 'all', label: 'Tất cả', status: '' },
    { id: 'pending', label: 'Chờ xác nhận', status: 'Pending' },
    { id: 'processing', label: 'Đang xử lý', status: 'Processing' },
    { id: 'shipping', label: 'Đang giao', status: 'Shipping' },
    { id: 'delivered', label: 'Đã giao', status: 'Delivered' },
    { id: 'cancelled', label: 'Đã hủy', status: 'Cancelled' }
  ];

  // Load đơn hàng khi component mount hoặc khi tab thay đổi
  useEffect(() => {
    const selectedTab = tabs.find((tab) => tab.id === activeTab);
    dispatch(fetchUserOrders({ page: 1, limit: 5, status: selectedTab?.status || '' }));
  }, [activeTab, dispatch]);

  // Xử lý thay đổi tab
  const handleTabChange = (tabId) => {
    dispatch(setActiveTab(tabId));
  };

  // Xử lý phân trang
  const handlePageChange = (newPage) => {
    const selectedTab = tabs.find((tab) => tab.id === activeTab);
    dispatch(
      fetchUserOrders({
        page: newPage,
        limit: 5,
        status: selectedTab?.status || ''
      })
    );
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = (orderId, reason) => {
    dispatch(cancelOrder({ orderId, reason }));
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement tìm kiếm đơn hàng
    console.log('Searching for:', searchKeyword);
    // Có thể gọi một action riêng để tìm kiếm đơn hàng
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-6 text-2xl font-medium'>Đơn hàng của tôi</h1>

      {/* Tabs */}
      <div className='no-scrollbar mb-6 flex justify-evenly overflow-x-auto rounded-sm border border-gray-200 bg-white shadow-sm'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`mx-1 whitespace-nowrap px-4 py-2 text-sm font-medium ${
              activeTab === tab.id ? 'border-b-4 border-[#333]' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tìm kiếm đơn hàng */}
      <div className='mb-6'>
        <form onSubmit={handleSearch} className='flex'>
          <div className='flex h-[36px] w-full'>
            <Input
              type='text'
              placeholder='Tìm kiếm theo ID đơn hàng hoặc tên sản phẩm'
              className='h-full rounded-r-none'
              prefix={<Search className='h-5 w-5' />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Button type='submit' className='h-full w-[100px] rounded-l-none'>
              Tìm kiếm
            </Button>
          </div>
        </form>
      </div>

      {/* Danh sách đơn hàng */}
      <div>
        {loading ? (
          <div className='flex justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-primaryColor' />
          </div>
        ) : error ? (
          <div className='rounded-sm bg-red-50 p-4 text-center text-red-600'>{error}</div>
        ) : orders.length === 0 ? (
          <div className='rounded-sm border border-gray-200 bg-gray-50 py-16 text-center'>
            <Package className='mx-auto h-16 w-16 text-gray-300' />
            <p className='mt-4 text-gray-500'>Bạn chưa có đơn hàng nào</p>
            <Link to='/shop' className='mt-4 inline-flex items-center'>
              <Button>Mua sắm ngay</Button>
            </Link>
          </div>
        ) : (
          <>
            {orders.map((order) => (
              <OrderItem key={order._id} order={order} onCancel={handleCancelOrder} />
            ))}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className='mt-6 flex justify-center'>
                <nav className='inline-flex rounded-md shadow'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`rounded-l-md border px-3 py-1 ${
                      currentPage === 1
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`border-b border-t px-3 py-1 ${
                        currentPage === index + 1
                          ? 'bg-primaryColor text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`rounded-r-md border px-3 py-1 ${
                      currentPage === totalPages
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Sau
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
