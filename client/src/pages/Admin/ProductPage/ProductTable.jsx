import DeleteIcon from '@/components/AdminComponents/common/icon/DeleteIcon';
import EditIcon from '@/components/AdminComponents/common/icon/EditIcon';
import { formatCurrency } from '@/utils/format/formatCurrency';
import { Button, Card, Image, Input, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { Plus, RefreshCw, Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const ProductTable = ({ searchText, onSearch, onPageChange, onRefresh, onDelete, onEdit, onAdd }) => {
  const { products, pagination, filters, sort, loading, error } = useSelector((state) => state.adminProduct);

  const columns = useMemo(
    () => [
      {
        title: 'STT',
        dataIndex: 'index',
        key: 'index',
        render: (_, __, index) => (pagination.page - 1) * pagination.limit + index + 1,
        align: 'center',
        width: 30
      },
      {
        title: 'Ảnh',
        dataIndex: 'images',
        key: 'images',
        align: 'center',
        width: 120,
        render: (images) => (
          <Image.PreviewGroup>
            {images && images.length > 0 ? (
              <Image width={40} height={40} src={images[0]} style={{ objectFit: 'cover', marginRight: 4 }} />
            ) : (
              <div className='flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs text-gray-500'>
                No Image
              </div>
            )}
          </Image.PreviewGroup>
        )
      },
      {
        title: 'Tên sản phẩm',
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: 200,
        sorter: (a, b) => a.name.length - b.name.length,
        render: (name, record) => (
          <div className='flex flex-col'>
            <span className='font-medium'>{name}</span>
            {record?.featured && (
              <Tag color='gold' className='mt-1 w-fit'>
                Nổi bật
              </Tag>
            )}
          </div>
        )
      },
      {
        title: 'Danh mục',
        dataIndex: 'categoryId',
        key: 'category',
        width: 150,
        render: (category) => category?.name || 'Không xác định'
      },
      {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        align: 'right',
        width: 150,
        render: (_, record) => {
          if (!record?.variants || record?.variants.length === 0) {
            return 'N/A';
          }

          // Tìm giá thấp nhất và cao nhất
          let minPrice = Number.MAX_SAFE_INTEGER;
          let maxPrice = 0;

          record.variants.forEach((variant) => {
            const price = variant.price || variant.originalPrice;
            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;
          });

          // Nếu không tìm thấy giá hợp lệ
          if (minPrice === Number.MAX_SAFE_INTEGER) return 'N/A';

          // Nếu chỉ có một giá
          if (minPrice === maxPrice) {
            return formatCurrency(minPrice);
          }

          // Hiển thị khoảng giá
          return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
        }
      },
      {
        title: 'Thương hiệu',
        dataIndex: 'brand',
        key: 'brand',
        width: 150
      },
      {
        title: 'Đánh giá',
        dataIndex: 'averageRating',
        key: 'averageRating',
        width: 120,
        sorter: (a, b) => a.averageRating - b.averageRating,
        render: (averageRating) => {
          return (
            <div className='flex items-center'>
              <span className='mr-1'>{averageRating ? averageRating.toFixed(1) : 'N/A'}</span>
              {averageRating > 0 && (
                <Tag color='blue'>
                  <span className='text-xs'>⭐</span>
                </Tag>
              )}
            </div>
          );
        }
      },
      {
        title: 'Lượt bán',
        dataIndex: 'salesCount',
        key: 'salesCount',
        width: 120,
        sorter: (a, b) => a.salesCount - b.salesCount,
        render: (salesCount) => salesCount || 0
      },
      {
        title: 'Tình trạng',
        key: 'inStock',
        width: 120,
        onFilter: (value, record) => {
          const hasInStock = record?.variants && record?.variants.some((v) => v.stock > 0);
          return value === 'true' ? hasInStock : !hasInStock;
        },
        render: (_, record) => {
          const inStock = record?.variants && record?.variants.some((v) => v.stock > 0);
          const lowStock = record?.variants && record?.variants.some((v) => v.stock > 0 && v.stock < 5);
          const outOfStock = record?.variants && record?.variants.every((v) => v.stock <= 0);
          if (outOfStock) {
            return <Tag color='red'>Hết hàng</Tag>;
          } else if (lowStock) {
            return <Tag color='orange'>Sắp hết hàng</Tag>;
          } else if (inStock) {
            return <Tag color='green'>Còn hàng</Tag>;
          }
        }
      },

      {
        title: 'Hành động',
        align: 'center',
        key: 'action',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <Space
            size='small'
            style={{
              justifyContent: 'center',
              display: 'flex'
            }}
          >
            <Tooltip title='Chỉnh sửa'>
              <div>
                <EditIcon onClick={() => onEdit(record)} />
              </div>
            </Tooltip>
            <Popconfirm
              title='Bạn có chắc muốn xóa sản phẩm này?'
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
    [onEdit, onDelete, pagination]
  ); // Tạo danh sách màu sắc và kích thước duy nhất từ các biến thể sản phẩm
  // Function này được giữ để sử dụng sau này nếu cần
  /* 
  const getUniqueVariantValues = (field) => {
    if (loading || products.length === 0) return [];

    const allValues = products.flatMap((product) => product.variants.map((variant) => variant[field]));

    return [...new Set(allValues)];
  };

  // Có thể sử dụng để lọc theo màu sắc hoặc kích thước
  // const uniqueColors = getUniqueVariantValues('color');
  // const uniqueSizes = getUniqueVariantValues('size');
  */

  return (
    <Card className='bg-white shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          {/* Nút thêm sản phẩm mới */}
          <Button type='primary' icon={<Plus size={16} />} onClick={() => onAdd()} className='flex items-center'>
            Thêm sản phẩm mới
          </Button>
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

      {/* Bảng danh sách sản phẩm */}
      <Table
        rowKey='_id'
        columns={columns}
        dataSource={products}
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
          showTotal: (total) => `Tổng số ${total} sản phẩm`
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
            <h3 className='text-lg font-bold'>Danh sách sản phẩm</h3>
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
    </Card>
  );
};

ProductTable.propTypes = {
  searchText: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired
};

export default ProductTable;
