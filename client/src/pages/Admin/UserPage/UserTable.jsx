import BanIcon from '@/components/AdminComponents/common/icon/BanIcon';
import DeleteIcon from '@/components/AdminComponents/common/icon/DeleteIcon';
import EditIcon from '@/components/AdminComponents/common/icon/EditIcon';
import UnbanIcon from '@/components/AdminComponents/common/icon/UnbanIcon';
import { formatDate } from '@/utils/format/formatDate';
import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const UserTable = ({
  searchText,
  onSearch,
  onPageChange,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onUnban,
  onOpenBanModal
}) => {
  const { users, pagination, filters, sort, loading, error } = useSelector((state) => state.adminUser);
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
            <span>{`${record.lastName} ${record.firstName}`}</span>
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
        render: (phone) => phone || 'Không có'
      },
      {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
        render: (role) => {
          let color = role === 'admin' ? 'green' : 'blue';
          return <Tag color={color}>{role.toUpperCase()}</Tag>;
        }
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isBlocked',
        key: 'isBlocked',
        render: (isBlocked) => {
          let color = isBlocked ? 'red' : 'green';
          return <Tag color={color}>{isBlocked ? 'Bị cấm' : 'Hoạt động'}</Tag>;
        }
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
          <Space size='small'>
            <Tooltip title='Chỉnh sửa'>
              <div>
                <EditIcon onClick={() => onEdit(record)} />
              </div>
            </Tooltip>

            {/* Không cho phép chặn người dùng là admin */}
            {record.role !== 'admin' &&
              (record.isBlocked === true ? (
                <Tooltip title='Bỏ chặn người dùng'>
                  <div>
                    <UnbanIcon onClick={() => onUnban(record._id)} />
                  </div>
                </Tooltip>
              ) : (
                <Tooltip title='Chặn người dùng'>
                  <div>
                    <BanIcon onClick={() => onOpenBanModal(record._id)} />
                  </div>
                </Tooltip>
              ))}

            <Popconfirm
              title='Bạn có chắc chắn muốn xóa người dùng này?'
              onConfirm={() => onDelete(record._id)}
              okText='Có'
              cancelText='Không'
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
    ],
    [onEdit, onUnban, onDelete, onOpenBanModal]
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
            prefix={<Search width={18} />}
            style={{ width: 250 }}
            value={searchText}
            onChange={onSearch}
            allowClear
          />
        </div>
      </div>
      <Table
        rowKey='_id'
        dataSource={users}
        columns={columns}
        loading={loading}
        scroll={{ x: 'max-content' }}
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
      />
    </Card>
  );
};

UserTable.propTypes = {
  searchText: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUnban: PropTypes.func.isRequired,
  onOpenBanModal: PropTypes.func.isRequired
};

export default UserTable;
