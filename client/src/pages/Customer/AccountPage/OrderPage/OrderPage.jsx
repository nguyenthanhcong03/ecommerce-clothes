import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import OrderItem from '@/pages/customer/AccountPage/OrderPage/components/OrderItem';
import { cancelOrder, fetchUserOrders, setActiveTab } from '@/store/slices/userOrderSlice';
import { ClipboardList, Loader2, Package, Search, Timer } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet } from 'react-router-dom';

const OrderPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, totalPages, currentPage, activeTab } = useSelector((state) => state.userOrder);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Danh sách tabs
  const tabs = React.useMemo(
    () => [
      { id: 'all', label: 'Tất cả', status: '' },
      { id: 'unpaid', label: 'Chưa thanh toán', status: 'Unpaid' },
      { id: 'pending', label: 'Chờ xác nhận', status: 'Pending' },
      { id: 'processing', label: 'Đang xử lý', status: 'Processing' },
      { id: 'shipping', label: 'Đang giao', status: 'Shipping' },
      { id: 'delivered', label: 'Đã giao', status: 'Delivered' },
      { id: 'cancelled', label: 'Đã hủy', status: 'Cancelled' }
    ],
    []
  );

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
  };

  // Load đơn hàng khi component mount hoặc khi tab thay đổi
  useEffect(() => {
    const selectedTab = tabs.find((tab) => tab.id === activeTab);
    dispatch(fetchUserOrders({ status: selectedTab?.status || '' }));
  }, [dispatch, activeTab, tabs]);

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-8'>
        <div className='mb-4 flex items-center space-x-4'>
          <div className='rounded-lg bg-blue-100 p-2'>
            <ClipboardList className='h-6 w-6 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Đơn hàng của tôi</h1>
            <p className='hidden text-base text-gray-600 md:block'>
              Xem chi tiết đơn hàng, tình trạng giao hàng và quản lý các đơn mua trước đó một cách dễ dàng.
            </p>
          </div>
        </div>
      </div>

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
