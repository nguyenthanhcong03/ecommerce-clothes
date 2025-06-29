import AdminHeader from '@/components/AdminComponents/common/AdminHeader';
import useDebounce from '@/hooks/useDebounce';
import CountdownTimer from '@/pages/customer/AccountPage/OrderPage/components/CountdownTimer';
import { updatePaymentStatusAPI } from '@/services/orderService';
import { fetchOrders, setLimit, setPage } from '@/store/slices/adminOrderSlice';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { formatDate } from '@/utils/format/formatDate';
import { orderStatuses } from '@/utils/helpers/orderStatusUtils';
import { ClockCircleOutlined, DollarOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, message, Modal, Select, Space, Table, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import VNPayLogo from '@/assets/images/vnpay-logo-vinadesign-25-12-59-16.jpg';
import { updateOrderStatus } from '@/store/slices/adminOrderSlice';
import { getValidStatusTransitions } from '@/utils/helpers/orderStatusUtils';
import OrderDetails from './OrderDetails';
import OrderFilters from './OrderFilters';
import './OrdersPage.scss';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, pagination, filters, loading, error } = useSelector((state) => state.adminOrder);
  const [searchText, setSearchText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingOrderIds, setUpdatingOrderIds] = useState([]);
  const [sortOption, setSortOption] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [filteredInfo, setFilteredInfo] = useState({});

  const debouncedSearchText = useDebounce(searchText, 500);
  console.log('pagination', pagination);

  // Tạo params cho API từ state với các tùy chọn lọc mở rộng
  const fetchAllOrders = useCallback(() => {
    const queryParams = {
      page: pagination.page || 1,
      limit: pagination.limit || 5,
      search: debouncedSearchText,
      sortBy: sortOption.sortBy || 'createdAt',
      sortOrder: sortOption.sortOrder || 'desc',
      ...filters
    };

    // Loại bỏ các tham số undefined
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    dispatch(fetchOrders(queryParams));
  }, [dispatch, pagination.page, pagination.limit, debouncedSearchText, sortOption, filters]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách đơn hàng: ${error.message}`);
    }
  }, [error]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleRefresh = () => {
    fetchAllOrders();
  };
  // const handleFilterChange = (newFilters) => {
  //     // Reset về trang 1 khi áp dụng bộ lọc mới
  //     dispatch(setPage(1));
  //     dispatch(setFilter(newFilters));
  //   };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  const handlePageChange = (page, pageSize) => {
    dispatch(setPage(page));
    if (pageSize !== pagination.limit) {
      dispatch(setLimit(pageSize));
    }
  };

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await dispatch(updateOrderStatus({ orderId: selectedOrder._id, status: newStatus })).unwrap();
      message.success(`Trạng thái đơn hàng đã cập nhật thành ${newStatus}`);
      // fetchAllOrders();
      setStatusModalVisible(false);
    } catch (error) {
      message.error(`Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}`);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    // Thêm orderId vào danh sách đang cập nhật để hiển thị loading state
    setUpdatingOrderIds((prev) => [...prev, orderId]);

    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      message.success(`Trạng thái đơn hàng đã cập nhật thành ${newStatus}`);
      // fetchAllOrders();
    } catch (error) {
      message.error(`Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}`);
    } finally {
      // Xóa orderId khỏi danh sách đang cập nhật khi hoàn thành
      setUpdatingOrderIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handlePaymentStatusChange = async (orderId, isPaid) => {
    try {
      await updatePaymentStatusAPI(orderId, isPaid);
      message.success(`Trạng thái thanh toán đã được cập nhật`);
      fetchAllOrders();
    } catch (error) {
      message.error(`Lỗi khi cập nhật trạng thái thanh toán: ${error.message}`);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <span className='text-xs text-gray-500'>{id.substring(0, 8)}...</span>,
      width: 100
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      render: (user) =>
        user ? (
          <div>
            <span className='font-semibold'>
              {user.lastName} {user.firstName}
            </span>
          </div>
        ) : (
          'Khách vãng lai'
        ),
      width: 200
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      sorter: true,
      width: 150
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      align: 'right',
      key: 'totalPrice',
      render: (price) => formatCurrency(price),
      sorter: true,
      width: 150
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment',
      key: 'payment.method',
      width: 150,
      render: (payment) => {
        switch (payment.method) {
          case 'COD':
            return '💵 Thanh toán khi nhận hàng';
          case 'VNPay':
            return (
              <div className='flex items-center gap-1'>
                <img src={VNPayLogo} className='h-5 w-5' alt='VNPay' />
                VNPay
                {/* <Tag color={payment.isPaid ? 'green' : 'volcano'}>
                  {payment.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Tag> */}
              </div>
            );
          default:
            return 'Không xác định';
        }
      }
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isUpdating = updatingOrderIds.includes(record._id);
        if (status === 'Unpaid') {
          return (
            <div className='flex flex-col items-center gap-1'>
              <span className='rounded-md border border-[#f09535] bg-[#fffaef] px-2 text-[#f09535]'>
                Chưa thanh toán
              </span>
              <CountdownTimer createdAt={record.createdAt} />
            </div>
          );
        }
        return (
          <Select
            value={status}
            // value={translateOrderStatus(status)}
            style={{
              width: '100%'
            }}
            loading={isUpdating}
            disabled={isUpdating || status === 'Cancelled'}
            onChange={(value) => handleOrderStatusChange(record._id, value)}
            options={orderStatuses}
            // options={getValidStatusTransitions(status)}
            listItemHeight={30}
            dropdownStyle={{
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          />
        );
      },
      filters: [
        { text: 'Chờ xác nhận', value: 'Pending' },
        { text: 'Đang xử lý', value: 'Processing' },
        { text: 'Đang giao', value: 'Shipping' },
        { text: 'Đã giao', value: 'Delivered' },
        { text: 'Đã hủy', value: 'Cancelled' }
      ],
      filteredValue: filteredInfo.status || null,
      width: 180
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Space size='small'>
          <Tooltip title='Xem chi tiết'>
            <Button type='primary' icon={<EyeOutlined />} size='small' onClick={() => showOrderDetails(record)} />
          </Tooltip>
          <Tooltip title='Cập nhật trạng thái'>
            <Button
              type='default'
              icon={<ClockCircleOutlined />}
              size='small'
              onClick={() => openStatusModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.payment.isPaid ? 'Đánh dấu chưa thanh toán' : 'Đánh dấu đã thanh toán'}>
            <Button
              type={record.payment.isPaid ? 'default' : 'primary'}
              danger={record.payment.isPaid}
              icon={<DollarOutlined />}
              size='small'
              onClick={() => handlePaymentStatusChange(record._id, !record.payment.isPaid)}
            />
          </Tooltip>
        </Space>
      ),
      width: 180
    }
  ];

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <AdminHeader title='Quản lý đơn hàng' />
      <main className='mx-auto px-4 py-6 lg:px-8'>
        {/* Search and Filters */}
        <OrderFilters
          onSearch={handleSearch}
          onFilterChange={(filters) => {
            // Xây dựng params cho API từ filters
            const params = {
              ...filters,
              page: 1
            };

            fetchAllOrders(params);
          }}
          onClear={handleRefresh}
          searchText={searchText}
          loading={loading}
        />

        <Card className='mb-6'>
          <div className='mb-4 flex justify-end'>
            <Button loading={loading} type='primary' icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </Button>
          </div>

          {/* Orders Table */}
          <Table
            columns={columns}
            dataSource={orders}
            rowKey='_id'
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: handlePageChange,
              position: ['bottomCenter'],
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `Tổng ${total} đơn hàng`
            }}
            loading={loading}
            scroll={{ x: 'max-content' }} // Cho phép cuộn ngang
            locale={{
              emptyText: loading
                ? 'Đang tải dữ liệu...'
                : searchText
                  ? 'Không tìm thấy kết quả phù hợp'
                  : 'Không có dữ liệu'
            }}
            title={() => (
              <div className='flex items-center justify-between rounded-t-lg'>
                <h3 className='text-lg font-bold'>Danh sách đơn hàng</h3>
              </div>
            )}
          />
        </Card>

        {/* Order Details Modal */}
        <Modal
          title={`Chi tiết đơn hàng #${selectedOrder?._id?.substring(0, 10)}...`}
          open={detailsVisible}
          onCancel={() => setDetailsVisible(false)}
          footer={[
            <Button key='close' onClick={() => setDetailsVisible(false)}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          <OrderDetails order={selectedOrder} />
        </Modal>

        {/* Update Status Modal */}
        <Modal
          title='Cập nhật trạng thái đơn hàng'
          open={statusModalVisible}
          onOk={handleStatusChange}
          onCancel={() => setStatusModalVisible(false)}
        >
          <div className='py-4'>
            <p className='mb-4'>Chọn trạng thái mới cho đơn hàng #{selectedOrder?._id?.substring(0, 10)}...</p>
            <Select
              value={newStatus}
              onChange={(value) => setNewStatus(value)}
              style={{ width: '100%' }}
              options={() => getValidStatusTransitions(selectedOrder?.status)}
            ></Select>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default OrdersPage;
