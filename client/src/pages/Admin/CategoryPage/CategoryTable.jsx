import { fetchCategories } from '@/redux/features/category/categorySlice';
import { buildTree } from '@/utils/convertFlatArrToTreeArr';
import { Button, Image, Input, Popconfirm, Space, Table, Tag, Tooltip, message } from 'antd';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import React, { memo, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { deleteCategory } from '../../../redux/features/category/categorySlice';

const CategoryTable = ({
  categories,
  loading,
  searchText,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onRefresh,
  onDelete,
  onEdit,
  onAdd
}) => {
  console.log('table');
  const dispatch = useDispatch();

  // Làm mới danh sách danh mục
  const handleRefresh = useCallback(() => {
    dispatch(fetchCategories({ page: 1, limit: 10 }));
    message.success('Danh sách danh mục đã được cập nhật');
  }, [dispatch]);

  // Xử lý xóa danh mục
  const handleDeleteCategory = useCallback(
    async (id) => {
      const resultAction = await dispatch(deleteCategory(id));
      if (deleteCategory.fulfilled.match(resultAction)) {
        message.success('Xóa danh mục thành công!');
      } else if (deleteCategory.rejected.match(resultAction)) {
        message.error(resultAction.payload?.message || 'Có lỗi xảy ra khi xóa danh mục');
      }
    },
    [dispatch]
  );

  // Định nghĩa các cột trong bảng - tối ưu bằng useMemo
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
        title: 'Trạng thái',
        dataIndex: 'isActive',
        align: 'center',
        key: 'isActive',
        width: 120,
        filters: [
          { text: 'Hoạt động', value: true },
          { text: 'Không hoạt động', value: false }
        ],
        onFilter: (value, record) => record.isActive === value, // Lọc theo trạng thái
        render: (isActive) => (isActive ? <Tag color='green'>Hoạt động</Tag> : <Tag color='red'>Không hoạt động</Tag>)
      },
      {
        title: 'Ưu tiên',
        dataIndex: 'priority',
        key: 'priority',
        align: 'center',
        width: 100,
        sorter: (a, b) => a.priority - b.priority, // Sắp xếp theo mức độ ưu tiên
        render: (priority) => <span className='text-gray-700'>{priority || 0}</span>
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
    [onEdit, onDelete]
  );

  // Memoize dữ liệu cây danh mục để tránh tính toán lại
  const treeData = useMemo(() => buildTree(categories), [categories]);

  return (
    <div className='rounded-md bg-white p-4 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {/* Nút thêm danh mục mới */}
          <Button type='primary' icon={<Plus size={16} />} onClick={onAdd} className='flex items-center'>
            Thêm danh mục mới
          </Button>
          {/* Nút làm mới danh sách */}
          <Button icon={<RefreshCw size={16} />} onClick={handleRefresh} className='ml-2 flex items-center'>
            Làm mới
          </Button>
        </div>
        {/* Ô tìm kiếm danh mục */}
        <Input
          placeholder='Tìm kiếm danh mục...'
          prefix={<Search size={16} color='#999' />}
          value={searchText}
          onChange={onSearchChange}
          style={{ width: 250 }}
          allowClear
        />
      </div>

      {/* Bảng danh sách danh mục */}
      <Table
        bordered
        scroll={{ x: 'max-content' }} // Cho phép cuộn ngang
        rowKey='_id'
        columns={columns}
        dataSource={treeData} // Sử dụng dữ liệu đã được memoize
        loading={loading}
        pagination={{
          pageSize,
          current: currentPage,
          onChange: onPageChange,
          onShowSizeChange: onPageSizeChange,
          position: ['bottomCenter'],
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
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
      />
    </div>
  );
};

export default memo(CategoryTable);
