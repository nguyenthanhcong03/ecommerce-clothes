import DeleteIcon from '@/components/AdminComponents/common/icon/DeleteIcon';
import EditIcon from '@/components/AdminComponents/common/icon/EditIcon';
import { buildTree } from '@/utils/helpers/buildTree';
import { Button, Card, Image, Input, Popconfirm, Space, Table, Tooltip } from 'antd';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import './hihi.css';

const CategoryTable = ({
  categories,
  pagination,
  onChange,
  onSearch,
  onRefresh,
  onDelete,
  onEdit,
  onAdd,
  searchText,
  filters
}) => {
  const columns = useMemo(
    () => [
      {
        title: 'Ảnh',
        dataIndex: 'images',
        key: 'images',
        align: 'left',
        className: 'fit-column',
        width: '20%',
        render: (images) => (
          <Image.PreviewGroup>
            {images && images.length > 0 ? (
              images
                .slice(0, 2)
                .map((img, index) => (
                  <Image key={index} width={40} height={40} src={img} style={{ objectFit: 'cover' }} />
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
          <Space size='small'>
            {/* Nút chỉnh sửa danh mục */}
            <Tooltip title='Chỉnh sửa'>
              <div>
                <EditIcon onClick={() => onEdit(record)} />
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
            >
              {/* Nút xóa danh mục */}
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
    [onEdit, onDelete]
  );
  const { categoriesTree, error, loading } = useSelector((state) => state.category);

  const treeData = useMemo(() => buildTree(categories), [categories]);

  return (
    <Card className='bg-white shadow'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Button type='primary' icon={<Plus size={16} />} onClick={() => onAdd()} className='flex items-center'>
            Thêm danh mục mới
          </Button>
          <Button loading={loading} icon={<RefreshCw size={16} />} onClick={onRefresh} className='flex items-center'>
            Làm mới
          </Button>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm kiếm danh mục...'
            prefix={<Search />}
            style={{ width: 250 }}
            value={searchText}
            onChange={onSearch}
            allowClear
          />
        </div>
      </div>

      {/* Bảng danh sách danh mục */}
      <Table
        scroll={{ x: 'max-content' }} // Cho phép cuộn ngang
        rowKey='_id'
        columns={columns}
        dataSource={treeData}
        loading={loading}
        pagination={false}
        // pagination={{
        //   current: pagination.page,
        //   pageSize: pagination.limit,
        //   total: pagination.total,
        //   position: ['bottomCenter'],
        //   showSizeChanger: true,
        //   // pageSizeOptions: ['5', '10', '20', '50'],
        //   showTotal: (total) => `Tổng số ${total} danh mục`
        // }}
        locale={{
          emptyText: loading
            ? 'Đang tải dữ liệu...'
            : searchText
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Không có dữ liệu'
        }}
        title={() => (
          <div className='flex items-center justify-between rounded-t-lg'>
            <h3 className='text-lg font-bold'>Danh sách danh mục</h3>
          </div>
        )}
        // // expandable={true}
        // expandable={{
        //   defaultExpandAllRows: false, // Mặc định không mở rộng tất cả
        //   fixed: true,
        //   indentSize: 50, // Kích thước lề cho các danh mục con
        //   expandedRowClassName: 'expanded-row', // Thêm class cho hàng mở rộng
        //   expandIcon: ({ expanded, onExpand, record }) => {
        //     // Chỉ hiển thị nút expand khi có danh mục con
        //     if (!record.children || record.children.length === 0) {
        //       return <span className='ml-2' />;
        //     }
        //     return (
        //       <Button
        //         type='text'
        //         className=''
        //         icon={expanded ? <MinusSquare size={16} /> : <PlusSquare size={16} />}
        //         onClick={(e) => {
        //           e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
        //           onExpand(record, e);
        //         }}
        //       />
        //     );
        //   }
        // }}
        onChange={onChange}
      />
    </Card>
  );
};

export default memo(CategoryTable);
