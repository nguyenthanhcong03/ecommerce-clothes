import DeleteIcon from '@/components/AdminComponents/common/icon/DeleteIcon';
import EditIcon from '@/components/AdminComponents/common/icon/EditIcon';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { formatDate } from '@/utils/format/formatDate';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Input, Menu, Popconfirm, Space, Switch, Table, Tag, Tooltip, Typography } from 'antd';
import { Plus, RefreshCw, Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

const { Text } = Typography;

const CouponTable = ({ searchText, onSearch, onPageChange, onRefresh, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const { coupons, pagination, filters, loading, error } = useSelector((state) => state.adminCoupon);
  const dispatch = useDispatch();

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
      dataIndex: 'discountValue',
      key: 'discountValue',
      align: 'right',
      render: (value, record) => (
        <div>
          <Text>{record.discountType === 'percentage' ? `${value}%` : formatCurrency(value)}</Text>
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
          onChange={() => onToggleStatus(record)}
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
      render: (_, record) => (
        <Space size='small'>
          <Tooltip title='Chỉnh sửa'>
            <div>
              <EditIcon onClick={() => onEdit(record)} />
            </div>
          </Tooltip>

          <Popconfirm
            title='Bạn có chắc chắn muốn xóa mã giảm giá này?'
            onConfirm={() => onDelete(record._id)}
            okText='Có'
            cancelText='Không'
            placement='topRight'
          >
            <Tooltip title='Xóa'>
              <div>
                <DeleteIcon />
              </div>
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card className='bg-white shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Button type='primary' icon={<Plus size={16} />} onClick={() => onAdd()} className='flex items-center'>
            Thêm mã giảm giá mới
          </Button>
          <Button icon={<RefreshCw size={16} />} onClick={onRefresh} className='flex items-center'>
            Làm mới
          </Button>
        </div>

        {/* Ô tìm kiếm mã giảm giá */}
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
      <Table
        rowKey='_id'
        columns={columns}
        dataSource={coupons}
        loading={loading}
        scroll={{ x: 'max-content' }} // Cho phép cuộn ngang
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
        locale={{ emptyText: loading ? 'Đang tải dữ liệu...' : 'Không có mã giảm giá nào' }}
        title={() => (
          <div className='flex items-center justify-between rounded-t-lg'>
            <h3 className='text-lg font-bold'>Danh sách mã giảm giá</h3>
          </div>
        )}
      />
    </Card>
  );
};

CouponTable.propTypes = {
  searchText: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired
};

export default CouponTable;
