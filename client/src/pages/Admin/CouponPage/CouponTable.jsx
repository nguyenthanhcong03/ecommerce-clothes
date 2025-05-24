import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Button, Card, Dropdown, Input, Menu, Modal, Switch, Table, Tag, Tooltip, Typography, message } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';

import { deleteCoupon, toggleCouponStatus } from '@/store/slices/couponSlice';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { formatDate } from '@/utils/format/formatDate';
import { Plus, RefreshCw } from 'lucide-react';

const { Text } = Typography;
const { confirm } = Modal;

const CouponTable = ({ coupons, pagination, onEdit, loading, onPageChange, onRefresh, onAdd }) => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDelete = (coupon) => {
    confirm({
      title: 'Xác nhận xóa mã giảm giá',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa mã giảm giá "${coupon.code}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await dispatch(deleteCoupon(coupon._id)).unwrap();
          messageApi.success(`Đã xóa mã giảm giá ${coupon.code} thành công`);
        } catch (error) {
          messageApi.error(error?.message || 'Có lỗi xảy ra khi xóa mã giảm giá');
        }
      }
    });
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await dispatch(
        toggleCouponStatus({
          id: coupon._id,
          isActive: !coupon.isActive
        })
      ).unwrap();
      messageApi.success(`Đã ${!coupon.isActive ? 'kích hoạt' : 'vô hiệu hóa'} mã giảm giá ${coupon.code}`);
    } catch (error) {
      messageApi.error(error?.message || 'Có lỗi xảy ra khi thay đổi trạng thái');
    }
  };

  const getCouponTypeLabel = (type) => {
    switch (type) {
      case 'percentage':
        return 'Phần trăm';
      case 'fixed':
        return 'Số tiền';
      default:
        return type;
    }
  };

  // Kiểm tra trạng thái còn hạn/hết hạn của coupon
  const getCouponTimeStatus = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'expired';
    return 'active';
  };

  const columns = [
    {
      title: 'Mã giảm giá',
      dataIndex: 'code',
      key: 'code',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type='secondary' ellipsis={{ tooltip: record.description }}>
            {record.description || 'Không có mô tả'}
          </Text>
          {getCouponTimeStatus(record) === 'expired' && (
            <Tag color='error' style={{ marginLeft: 5 }}>
              Hết hạn
            </Tag>
          )}
          {getCouponTimeStatus(record) === 'upcoming' && (
            <Tag color='processing' style={{ marginLeft: 5 }}>
              Sắp có
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type) => getCouponTypeLabel(type)
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      render: (value, record) => (
        <div>
          <Text>{record.type === 'percentage' ? `${value}%` : formatCurrency(value)}</Text>
          {record.type === 'percentage' && record.maxDiscountValue > 0 && (
            <div>
              <Text type='secondary' style={{ fontSize: '0.85em' }}>
                Tối đa: {formatCurrency(record.maxDiscountValue)}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Đơn hàng tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      align: 'right',
      render: (value) => (value > 0 ? formatCurrency(value) : 'Không giới hạn')
    },
    {
      title: 'Thời hạn',
      key: 'timeRange',
      render: (_, record) => (
        <div>
          <div>Từ: {formatDate(record.startDate)}</div>
          <div>Đến: {formatDate(record.endDate)}</div>
        </div>
      )
    },
    {
      title: 'Đã dùng/Giới hạn',
      key: 'usage',
      align: 'center',
      render: (_, record) => (
        <Tooltip
          title={
            record.usageLimit > 0
              ? `Đã sử dụng ${record.usedCount}/${record.usageLimit} lần`
              : `Đã sử dụng ${record.usedCount} lần, không giới hạn`
          }
        >
          <span>
            {record.usedCount}/{record.usageLimit > 0 ? record.usageLimit : '∞'}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record)}
          disabled={getCouponTimeStatus(record) === 'expired'}
        />
      ),
      filters: [
        { text: 'Đang kích hoạt', value: true },
        { text: 'Đã vô hiệu', value: false }
      ],
      onFilter: (value, record) => record.isActive === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item key='edit' icon={<EditOutlined />} onClick={() => onEdit(record)}>
              Chỉnh sửa
            </Menu.Item>
            <Menu.Item key='delete' danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              Xóa mã giảm giá
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ];

  return (
    <>
      <Card className='mb-4'>
        {contextHolder}
        <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Button type='primary' icon={<Plus size={16} />} onClick={() => onAdd()} className='flex items-center'>
              Thêm mã giảm giá mới
            </Button>
            <Button icon={<RefreshCw size={16} />} onClick={onRefresh} className='flex items-center'>
              Làm mới
            </Button>
          </div>

          {/* Ô tìm kiếm sản phẩm */}
          {/* <div className='flex flex-wrap items-center gap-2'>
            <Input
              placeholder='Tìm kiếm danh mục...'
              prefix={<Search />}
              style={{ width: 250 }}
              value={searchText}
              onChange={onSearch}
              allowClear
            />
          </div> */}
        </div>
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey='_id'
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: onPageChange,
            position: ['bottomCenter'],
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Tổng ${total} mã giảm giá`
          }}
          loading={loading}
          locale={{ emptyText: loading ? 'Đang tải dữ liệu...' : 'Không có mã giảm giá nào' }}
          scroll={{ x: 'max-content' }} // Cho phép cuộn ngang
          title={() => (
            <div className='flex items-center justify-between rounded-t-lg'>
              <h3 className='text-lg font-bold'>Danh sách mã giảm giá</h3>
            </div>
          )}
        />
      </Card>
    </>
  );
};

CouponTable.propTypes = {
  coupons: PropTypes.array.isRequired,
  pagination: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired
};

export default CouponTable;
