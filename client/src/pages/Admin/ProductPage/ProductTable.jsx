import {
  Button,
  Image,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Select,
  Pagination,
  Slider,
  Checkbox,
  Empty
} from 'antd';
import { Filter, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import './styles.css';
import { formatCurrency } from '@/utils/format/formatCurrency';

const { Option } = Select;

const ProductTable = ({
  products,
  pagination,
  onChange,
  onSearch,
  searchText,
  loading,
  onRefresh,
  onDelete,
  onEdit,
  onAdd,
  filters
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = useMemo(
    () => [
      {
        title: 'STT',
        dataIndex: 'index',
        key: 'index',
        align: 'center',
        width: 60
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
        title: 'Tên sản phẩm',
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: 200,
        sorter: true, // Dùng API sorting
        render: (name, record) => (
          <div className='flex flex-col'>
            <span className='font-medium'>{name}</span>
            {record.featured && (
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
        // filters: facets?.categories?.map((cat) => ({ text: cat.name, value: cat._id })),
        render: (category) => category || 'Không xác định'
      },
      {
        title: 'Giá',
        align: 'right',
        width: 150,
        render: (_, record) => {
          if (!record.variants || record.variants.length === 0) {
            return 'N/A';
          }

          // Tìm giá thấp nhất và cao nhất
          let minPrice = Number.MAX_SAFE_INTEGER;
          let maxPrice = 0;

          record.variants.forEach((variant) => {
            const price = variant.discountPrice || variant.price;
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
        },
        dataIndex: 'price',
        key: 'price',
        sorter: true // Dùng API sorting
      },
      {
        title: 'Thương hiệu',
        dataIndex: 'brand',
        key: 'brand',
        width: 150
        // filters: facets?.brands?.map((brand) => ({ text: brand.name, value: brand.name }))
      },
      {
        title: 'Đánh giá',
        dataIndex: 'averageRating',
        key: 'rating',
        width: 120,
        sorter: true, // Dùng API sorting
        render: (rating) => {
          return (
            <div className='flex items-center'>
              <span className='mr-1'>{rating ? rating.toFixed(1) : 'N/A'}</span>
              {rating > 0 && (
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
        sorter: true, // Dùng API sorting
        render: (salesCount) => salesCount || 0
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        key: 'tags',
        width: 200,
        render: (tags) => (
          <div className='flex flex-wrap gap-1'>
            {tags && Array.isArray(tags) && tags.length > 0 ? (
              tags.map((tag) => (
                <Tag color='blue' key={tag}>
                  {tag}
                </Tag>
              ))
            ) : (
              <span className='text-gray-400'>Không có</span>
            )}
          </div>
        )
      },
      {
        title: 'Tình trạng',
        key: 'inStock',
        width: 120,
        filters: [
          { text: 'Còn hàng', value: 'true' },
          { text: 'Hết hàng', value: 'false' }
        ],
        render: (_, record) => {
          const hasInStock = record.variants && record.variants.some((v) => v.stock > 0);
          return hasInStock ? <Tag color='green'>Còn hàng</Tag> : <Tag color='red'>Hết hàng</Tag>;
        }
      },
      {
        title: 'Trạng thái',
        key: 'isActive',
        width: 120,
        filters: [
          { text: 'Đang hoạt động', value: 'true' },
          { text: 'Đã tắt', value: 'false' }
        ],
        render: (_, record) => {
          return record.isActive ? <Tag color='green'>Hoạt động</Tag> : <Tag color='gray'>Đã tắt</Tag>;
        },
        filteredValue: filters.isActive ? ['true'] : undefined
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
            <Tooltip title='Chỉnh sửa'>
              <div className='cursor-pointer rounded-[5px] bg-[#0961FF] p-1 transition-colors hover:bg-blue-700'>
                <Pencil strokeWidth={1.5} width={16} height={16} onClick={() => onEdit(record)} color='#fff' />
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

  // Xử lý chọn row
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  // Tạo danh sách màu sắc và kích thước duy nhất từ các biến thể sản phẩm
  const getUniqueVariantValues = (field) => {
    if (loading || products.length === 0) return [];

    const allValues = products.flatMap((product) => product.variants.map((variant) => variant[field]));

    return [...new Set(allValues)];
  };

  const uniqueColors = getUniqueVariantValues('color');
  const uniqueSizes = getUniqueVariantValues('size');

  return (
    <div className='rounded-md bg-white p-4 shadow-sm'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          {/* Nút thêm sản phẩm mới */}
          <Button type='primary' icon={<Plus size={16} />} onClick={onAdd} className='flex items-center'>
            Thêm sản phẩm mới
          </Button>
          {/* Nút làm mới danh sách */}
          <Button icon={<RefreshCw size={16} />} onClick={onRefresh} className='flex items-center'>
            Làm mới
          </Button>
        </div>

        {/* Ô tìm kiếm sản phẩm */}
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm kiếm danh mục...'
            prefix={<Search />}
            style={{ width: 250 }}
            value={searchText}
            onChange={onSearch}
            allowClear
          />

          {/* Dropdown sắp xếp
          <Select placeholder='Sắp xếp theo' value={sortType} onChange={onSortChange} style={{ width: 180 }}>
            <Option value='latest'>Mới nhất</Option>
            <Option value='popular'>Phổ biến</Option>
            <Option value='top_sales'>Bán chạy</Option>
            <Option value='price_asc'>Giá tăng dần</Option>
            <Option value='price_desc'>Giá giảm dần</Option>
            <Option value='rating'>Đánh giá</Option>
          </Select> */}
        </div>
      </div>

      {/* Bảng danh sách sản phẩm */}
      <Table
        bordered
        rowKey='_id'
        className='product-table rounded-lg border bg-white'
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={products}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          position: ['bottomCenter'],
          showSizeChanger: true,
          // pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total) => `Tổng số ${total} danh mục`
        }}
        loading={loading}
        onChange={onChange}
        locale={{
          emptyText: loading
            ? 'Đang tải dữ liệu...'
            : searchText
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Không có dữ liệu'
        }}
        title={() => (
          <div className='flex items-center justify-between rounded-t-lg'>
            <h3 className='text-lg font-bold'>Danh sách sản phẩm</h3>
            {selectedRowKeys.length > 0 && (
              <div>
                <span className='mr-2'>{selectedRowKeys.length} sản phẩm đã chọn</span>
                <Button danger>Xóa sản phẩm đã chọn</Button>
              </div>
            )}
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
    </div>
  );
};

export default ProductTable;
