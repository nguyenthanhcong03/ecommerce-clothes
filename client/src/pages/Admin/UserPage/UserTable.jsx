import { formatDate } from '@/utils/format/formatDate';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { Lock, LockOpen, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

const UserTable = ({
  users,
  loading,
  pagination,
  onPageChange,
  onSearch,
  onAdd,
  onRefresh,
  searchText,
  onEdit,
  onDelete,
  onBan,
  onUnban,
  filters
}) => {
  // Tạo cột cho bảng
  const columns = useMemo(
    () => [
      {
        title: 'Tên',
        dataIndex: 'firstName',
        key: 'name',
        render: (text, record) => (
          <div className='flex items-center'>
            {record.avatar ? (
              <img
                src={record.avatar}
                alt={`${record.firstName} ${record.lastName}`}
                className='mr-3 h-10 w-10 rounded-full'
              />
            ) : (
              <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                <UserOutlined style={{ color: '#1890ff' }} />
              </div>
            )}
            <span>{`${record.firstName} ${record.lastName}`}</span>
          </div>
        ),
        sorter: true
      },
      {
        title: 'Tên đăng nhập',
        dataIndex: 'username',
        key: 'username',
        sorter: true
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        sorter: true
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        render: (phone) => phone || '-'
      },
      {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
        render: (role) => {
          let color = role === 'admin' ? 'green' : 'blue';
          return <Tag color={color}>{role.toUpperCase()}</Tag>;
        },
        filters: [
          { text: 'Admin', value: 'admin' },
          { text: 'Customer', value: 'customer' }
        ],
        filteredValue: filters.role ? [filters.role] : null
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isBlocked',
        key: 'isBlocked',
        render: (isBlocked) => {
          let color = isBlocked ? 'red' : 'green';
          return <Tag color={color}>{isBlocked ? 'Bị cấm' : 'Hoạt động'}</Tag>;
        },
        filters: [
          { text: 'Hoạt động', value: 'false' },
          { text: 'Bị cấm', value: 'true' }
        ],
        filteredValue: filters.isBlocked ? [filters.isBlocked] : null
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date) => formatDate(date),
        sorter: true
      },
      {
        title: 'Thao tác',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
          <Space size='middle'>
            <Tooltip title='Chỉnh sửa'>
              <button
                className='rounded-[5px] bg-[#0961FF] p-1 transition-colors hover:bg-blue-700'
                onClick={() => onEdit(record)}
              >
                <Pencil strokeWidth={1.5} width={16} height={16} color='#fff' />
              </button>
            </Tooltip>

            {/* Không cho phép chặn người dùng là admin */}
            {record.role !== 'admin' &&
              (record.isBlocked === true ? (
                <Tooltip title='Bỏ chặn người dùng'>
                  <button
                    className='rounded-[5px] bg-[#52c41a] p-1 transition-colors'
                    onClick={() => onUnban(record._id)}
                  >
                    <LockOpen strokeWidth={1.5} width={16} height={16} color='#fff' />
                  </button>
                </Tooltip>
              ) : (
                <Tooltip title='Chặn người dùng'>
                  <button className='rounded-[5px] bg-black p-1 transition-colors' onClick={() => onBan(record._id)}>
                    <Lock strokeWidth={1.5} width={16} height={16} color='#fff' />
                  </button>
                </Tooltip>
              ))}

            <Popconfirm
              title='Bạn có chắc chắn muốn xóa người dùng này?'
              onConfirm={() => onDelete(record._id)}
              okText='Có'
              cancelText='Không'
            >
              <Tooltip title='Xóa'>
                <button className='rounded-[5px] bg-[#DE2E3D] p-1 transition-colors hover:bg-red-700'>
                  <Trash2 strokeWidth={1.5} width={16} height={16} color='#fff' />
                </button>
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [onEdit, onDelete, onBan, onUnban, filters]
  );

  return (
    <Card className='bg-white shadow'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Button type='primary' icon={<Plus size={16} />} onClick={() => onAdd()} className='flex items-center'>
            Thêm người dùng mới
          </Button>
          <Button icon={<RefreshCw size={16} />} onClick={onRefresh} className='flex items-center'>
            Làm mới
          </Button>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm kiếm người dùng...'
            prefix={<Search />}
            style={{ width: 250 }}
            value={searchText}
            onChange={onSearch}
            allowClear
          />
        </div>
      </div>
      <Table
        dataSource={users}
        columns={columns}
        rowKey='_id'
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          position: ['bottomCenter'],
          onChange: onPageChange,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total) => `Tổng số ${total} sản phẩm`
        }}
        locale={{
          emptyText: loading
            ? 'Đang tải dữ liệu...'
            : searchText
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Không có dữ liệu'
        }}
        title={() => (
          <div className='flex items-center justify-between rounded-t-lg'>
            <h3 className='text-lg font-bold'>Danh sách tài khoản người dùng</h3>
          </div>
        )}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};

export default UserTable;
