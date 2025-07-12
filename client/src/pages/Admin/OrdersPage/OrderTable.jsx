import VNPayLogo from '@/assets/images/vnpay-logo-vinadesign-25-12-59-16.jpg';
import OrderDetails from '@/pages/admin/OrdersPage/OrderDetails';
import CountdownTimer from '@/pages/customer/AccountPage/OrderPage/components/CountdownTimer';
import { updatePaymentStatusAPI } from '@/services/orderService';
import { updateOrderStatus } from '@/store/slices/adminOrderSlice';
import { formatCurrency } from '@/utils/format/formatCurrency';
import formatDate from '@/utils/format/formatDate';
import { getValidStatusTransitions, translateOrderStatus } from '@/utils/helpers/orderStatusUtils';
import { DollarOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Input, message, Modal, Select, Space, Table, Tag, Tooltip } from 'antd';
import { RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const OrderTable = ({ searchText, onSearch, onPageChange, onRefresh }) => {
  const dispatch = useDispatch();
  const { orders, pagination, filters, loading, error } = useSelector((state) => state.adminOrder);
  const [updatingOrderIds, setUpdatingOrderIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');

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
      onRefresh();
    } catch (error) {
      message.error(`Lỗi khi cập nhật trạng thái thanh toán: ${error.message}`);
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

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
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
              </div>
            );
          default:
            return 'Không xác định';
        }
      }
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'payment',
      key: 'payment.isPaid',
      render: (payment) => (
        <Tag color={payment.isPaid ? 'green' : 'volcano'}>
          {payment.isPaid ? 'Đã thanh toán' : payment?.isPaid === false ? 'Chưa thanh toán' : 'Đã hủy'}
        </Tag>
      )
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        console.log('status', status);
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
            value={translateOrderStatus(status)}
            style={{
              width: '100%'
            }}
            loading={isUpdating}
            disabled={isUpdating || status === 'Cancelled'}
            onChange={(value) => handleOrderStatusChange(record._id, value)}
            // options={orderStatuses}
            options={getValidStatusTransitions(status)}
            listItemHeight={30}
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
          {/* <Tooltip title='Cập nhật trạng thái'>
            <Button
              type='default'
              icon={<ClockCircleOutlined />}
              size='small'
              onClick={() => openStatusModal(record)}
            />
          </Tooltip> */}
          {/* {record.payment.method !== 'COD' && (
            <Tooltip title={record.payment.isPaid ? 'Đánh dấu chưa thanh toán' : 'Đánh dấu đã thanh toán'}>
              <Button
                type={record.payment.isPaid ? 'default' : 'primary'}
                danger={record.payment.isPaid}
                icon={<DollarOutlined />}
                size='small'
                onClick={() => handlePaymentStatusChange(record._id, !record.payment.isPaid)}
              />
            </Tooltip>
          )} */}
        </Space>
      ),
      width: 180
    }
  ];

  return (
    <Card className='bg-white shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          {/* Nút làm mới danh sách */}
          <Button loading={loading} icon={<RefreshCw size={16} />} onClick={onRefresh} className='flex items-center'>
            Làm mới
          </Button>
        </div>

        {/* Ô tìm kiếm sản phẩm */}
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm kiếm sản phẩm...'
            prefix={<Search width={18} />}
            style={{ width: 300 }}
            value={searchText || ''}
            onChange={onSearch}
            allowClear
          />
        </div>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <Table
        rowKey='_id'
        columns={columns}
        dataSource={orders}
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: onPageChange,
          position: ['bottomCenter'],
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total) => `Tổng số ${total} đơn hàng`
        }}
        locale={{
          emptyText: loading
            ? 'Đang tải dữ liệu...'
            : filters.search
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Không có dữ liệu'
        }}
        title={() => (
          <div className='flex items-center justify-between rounded-t-lg'>
            <h3 className='text-lg font-bold'>Danh sách đơn hàng</h3>
          </div>
        )}
      />

      {/* Phân trang custom */}
      {/* <div className='mt-4 flex flex-wrap items-center justify-between gap-2 px-4'>
        <div>
          <span className='text-sm text-gray-600'>
            Hiển thị {products?.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(currentPage * pageSize, totalItems)}
            của {totalItems} sản phẩm
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Select value={pageSize} onChange={onPageSizeChange} style={{ width: 100 }}>
            <Option value={5}>5 / trang</Option>
            <Option value={10}>10 / trang</Option>
            <Option value={20}>20 / trang</Option>
            <Option value={50}>50 / trang</Option>
          </Select>

          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </div>
      </div> */}
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
    </Card>
  );
};

export default OrderTable;
