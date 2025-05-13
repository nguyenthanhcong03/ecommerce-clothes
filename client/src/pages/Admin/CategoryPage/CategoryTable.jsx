import { buildTree } from '@/utils/convertFlatArrToTreeArr';
import { Image, Input, Popconfirm, Space, Table, Tooltip } from 'antd';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { memo, useMemo } from 'react';

const CategoryTable = ({
  categories,
  loading,
  pagination,
  onChange,
  onSearch,
  onRefresh,
  onDelete,
  onEdit,
  searchText,
  filters
}) => {
  const columns = useMemo(
    () => [
      {
        title: 'Ảnh',
        dataIndex: 'images',
        key: 'images',
        align: 'center',
        width: 120,
        render: (images) => (
          <Image.PreviewGroup>
            {images && images.length > 0 ? (
              images
                .slice(0, 2)
                .map((img, index) => (
                  <Image key={index} width={40} height={40} src={img} style={{ objectFit: 'cover', marginRight: 4 }} />
                ))
            ) : (
              <div className='flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs text-gray-500'>
                No Image
              </div>
            )}
          </Image.PreviewGroup>
        )
      },
      {
        title: 'Tên danh mục',
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: 250,
        sorter: (a, b) => a.name.localeCompare(b.name), // Sắp xếp theo tên danh mục
        render: (name, record) => (
          <Tooltip
            title={record.children && record.children.length > 0 ? `${record.children.length} danh mục con` : null}
          >
            <span className='font-medium'>{name}</span>
          </Tooltip>
        )
      },
      {
        title: 'Mô tả',
        align: 'left',
        className: 'description-header',
        render: (_, record) => {
          const description = record.description || 'Chưa có mô tả';
          return <div className='text-left text-sm text-gray-600'>{description}</div>;
        },
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: 'Hành động',
        align: 'center',
        key: 'action',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <Space
            size='middle'
            style={{
              justifyContent: 'center',
              display: 'flex'
            }}
          >
            {/* Nút chỉnh sửa danh mục */}
            <Tooltip title='Chỉnh sửa'>
              <div className='cursor-pointer rounded-[5px] bg-[#0961FF] p-1 transition-colors hover:bg-blue-700'>
                <Pencil strokeWidth={1.5} width={16} height={16} onClick={() => onEdit(record)} color='#fff' />
              </div>
            </Tooltip>
            {/* Dialog xác nhận xóa danh mục */}
            <Popconfirm
              title='Bạn có chắc muốn xóa danh mục này?'
              description={
                record.children && record.children.length > 0
                  ? 'Cảnh báo: Xóa danh mục này cũng sẽ xóa tất cả danh mục con thuộc danh mục này!'
                  : undefined
              }
              onConfirm={() => onDelete(record._id)}
              okText='Có'
              cancelText='Không'
              placement='topRight'
              okButtonProps={{
                style: { backgroundColor: '#333', borderColor: '#333', color: 'white' }
              }}
              cancelButtonProps={{
                style: { color: 'gray', borderColor: 'gray' }
              }}
            >
              {/* Nút xóa danh mục */}
              <Tooltip title='Xóa'>
                <div className='cursor-pointer rounded-[5px] bg-[#DE2E3D] p-1 transition-colors hover:bg-red-700'>
                  <Trash2 strokeWidth={1.5} width={16} height={16} color='#fff' />
                </div>
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [onEdit, onDelete, filters]
  );

  // Memoize dữ liệu cây danh mục để tránh tính toán lại
  const treeData = useMemo(() => buildTree(categories), [categories]);

  return (
    <div className='rounded bg-white shadow'>
      <div className='flex items-center justify-between border-b p-4'>
        <h3 className='text-lg font-semibold'>Danh sách danh mục</h3>
        <Input
          placeholder='Tìm kiếm danh mục...'
          prefix={<Search />}
          style={{ width: 250 }}
          value={searchText}
          onChange={onSearch}
          allowClear
        />
      </div>

      {/* Bảng danh sách danh mục */}
      <Table
        bordered
        scroll={{ x: 'max-content' }} // Cho phép cuộn ngang
        rowKey='_id'
        columns={columns}
        dataSource={treeData}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          position: ['bottomCenter'],
          showSizeChanger: true,
          // pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total) => `Tổng số ${total} danh mục`
        }}
        locale={{
          emptyText: loading
            ? 'Đang tải dữ liệu...'
            : searchText
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Không có dữ liệu'
        }}
        title={() => (
          <div className='flex flex-col items-center justify-between rounded-t-lg lg:flex-row'>
            <h3 className='text-xl font-bold'>Danh sách danh mục</h3>
          </div>
        )}
        expandable={{
          defaultExpandAllRows: false // Mặc định không mở rộng tất cả
        }}
        onChange={onChange}
        // scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default memo(CategoryTable);
