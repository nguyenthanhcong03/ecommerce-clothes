import { useState, useCallback, useEffect } from 'react';
import { updateOrderStatusAPI, updatePaymentStatusAPI } from '@/services/orderService';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, setFilters } from '@/store/slices/adminOrderSlice';
import { Table, Card, Button, Space, Tag, Select, Modal, Tooltip, message, Typography } from 'antd';
import { ReloadOutlined, EyeOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './OrdersPage.scss';
import OrderDetails from './OrderDetails';
import OrderFilters from './OrderFilters';
import OrderStatistics from './OrderStatistics';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { formatDate } from '@/utils/format/formatDate';
import { orderStatuses, statusColors } from '@/utils/helpers/orderStatusUtils';
import useDebounce from '@/hooks/useDebounce';
import Header from '@/components/AdminComponents/common/Header';
import { updateOrderStatus } from '../../../store/slices/adminOrderSlice';
import { getValidStatusTransitions } from '../../../utils/helpers/orderStatusUtils';

const { Title } = Typography;
const { Option } = Select;

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector((state) => state.adminOrder);
  const [searchText, setSearchText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingOrderIds, setUpdatingOrderIds] = useState([]);
  const [sortInfo, setSortInfo] = useState({
    field: 'createdAt',
    order: 'descend'
  });
  const [filteredInfo, setFilteredInfo] = useState({});

  const debouncedSearchText = useDebounce(searchText, 500);

  // Tạo params cho API từ state với các tùy chọn lọc mở rộng
  const fetchAllOrders = useCallback(
    (params = {}) => {
      const queryParams = {
        page: params.page || pagination.page || 1,
        limit: params.limit || pagination.limit || 10,
        search: params.search !== undefined ? params.search : debouncedSearchText,
        sortBy: params.sortBy || sortInfo.field,
        sortOrder: params.sortOrder === 'ascend' ? 'asc' : 'desc',
        status: params.status,
        paymentStatus: params.paymentStatus,
        paymentMethod: params.paymentMethod,
        startDate: params.startDate,
        endDate: params.endDate,
        minAmount: params.minAmount,
        maxAmount: params.maxAmount
      };

      // Loại bỏ các tham số undefined
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });
      console.log('quaryParams', queryParams);

      dispatch(fetchOrders(queryParams));
    },
    [dispatch, pagination.page, pagination.limit, debouncedSearchText, sortInfo.field]
  );

  useEffect(() => {
    fetchAllOrders();
  }, [debouncedSearchText, fetchAllOrders]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách đơn hàng: ${error.message}`);
    }
  }, [error]);

  // Handlers for table actions với hỗ trợ nhiều bộ lọc hơn
  const handleTableChange = (pagination, filters, sorter) => {
    console.log('filters', filters);
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || 'createdAt',
      sortOrder: sorter.order || 'descend',
      status: filters.status ? filters.status : undefined,
      paymentStatus: filters['payment.isPaid'] ? filters['payment.isPaid'] : undefined,
      paymentMethod: filters['payment.method'] ? filters['payment.method'] : undefined
    };

    // Lưu giá trị filters vào Redux và state
    dispatch(
      setFilters({
        status: params.status,
        paymentStatus: params.paymentStatus,
        paymentMethod: params.paymentMethod
      })
    );

    // Lưu thông tin filters hiện tại để có thể đặt lại sau này
    setFilteredInfo(filters);

    // Lưu thông tin sort
    setSortInfo({
      field: params.sortBy,
      order: params.sortOrder
    });
    console.log('paymentStatus', params.paymentStatus);

    fetchAllOrders(params);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleRefresh = () => {
    setSearchText('');

    // Reset tất cả các bộ lọc trong Redux
    dispatch(
      setFilters({
        search: '',
        status: undefined,
        paymentStatus: undefined,
        paymentMethod: undefined,
        startDate: undefined,
        endDate: undefined,
        minAmount: undefined,
        maxAmount: undefined
      })
    );

    // Reset các bộ lọc của bảng
    setFilteredInfo({});

    // Reset trạng thái sắp xếp về mặc định
    setSortInfo({
      field: 'createdAt',
      order: 'descend'
    });

    // Tải lại dữ liệu với các tham số mặc định
    fetchAllOrders({ page: 1, limit: 10 });
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
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
    console.log('Order', order);
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
            <div>{user.username}</div>
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
      sortOrder: sortInfo.field === 'createdAt' ? sortInfo.order : null,
      width: 150
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      align: 'right',
      key: 'totalPrice',
      render: (price) => formatCurrency(price),
      sorter: true,
      sortOrder: sortInfo.field === 'totalPrice' ? sortInfo.order : null,
      width: 150
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment',
      key: 'payment.method',
      width: 150,
      filters: [
        { text: 'Thanh toán khi nhận hàng', value: 'COD' },
        { text: 'Ví Momo', value: 'Momo' },
        { text: 'VNPay', value: 'VNPay' }
      ],
      filteredValue: filteredInfo['payment.method'] || null,
      render: (payment) => {
        switch (payment.method) {
          case 'COD':
            return 'Thanh toán khi nhận hàng';
          case 'Momo':
            return 'Ví Momo';
          case 'VNPay':
            return 'VNPay';
          default:
            return payment.method;
        }
      }
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'payment',
      key: 'payment.isPaid',
      render: (payment) => (
        <Tag color={payment.isPaid ? 'green' : 'volcano'}>{payment.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>
      ),
      filters: [
        { text: 'Đã thanh toán', value: true },
        { text: 'Chưa thanh toán', value: false }
      ],
      filteredValue: filteredInfo['payment.isPaid'] || null,
      width: 150
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isUpdating = updatingOrderIds.includes(record._id);
        // Lấy màu từ statusColors và sử dụng nó
        const statusColor = statusColors[status] || '#d9d9d9';

        return (
          <Select
            value={status}
            style={{
              width: '100%',
              // Thêm border color để sử dụng statusColor
              borderColor: isUpdating ? '#d9d9d9' : statusColor
            }}
            className={`status-select status-${status.toLowerCase()}`}
            loading={isUpdating}
            disabled={isUpdating}
            onChange={(value) => handleOrderStatusChange(record._id, value)}
            // options={getValidStatusTransitions(status)}
            options={orderStatuses}
            bordered={true}
            listItemHeight={30}
            dropdownStyle={{
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
            popupClassName={`dropdown-${status.toLowerCase()}`}
          />
        );
      },
      filters: [
        { text: 'Đang chờ xử lý', value: 'Pending' },
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
      <Header title='Quản lý đơn hàng' />
      <main className='mx-auto px-4 py-6 lg:px-8'>
        {/* Statistics Cards */}
        {/* <OrderStatistics /> */}

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
            <Button type='primary' icon={<ReloadOutlined />} onClick={handleRefresh}>
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
              position: ['bottomCenter'],
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`
            }}
            loading={loading}
            onChange={handleTableChange}
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
