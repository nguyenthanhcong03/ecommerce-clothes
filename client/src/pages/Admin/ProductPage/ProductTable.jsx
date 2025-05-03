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
import { formatCurrency } from '@/utils/formatCurrency';

const { Option } = Select;

const ProductTable = ({
  products,
  loading,
  searchText,
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  sortType,
  filters,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onToggleFilterValue,
  onClearFilters,
  onRefresh,
  onDelete,
  onEdit,
  onAdd
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Đảm bảo priceRange được cập nhật khi filters thay đổi
  useEffect(() => {
    // Nếu có minPrice hoặc maxPrice trong filters, sử dụng chúng
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      setPriceRange([(filters.minPrice = 0), (filters.maxPrice = 10000000)]);
    }
  }, [filters.minPrice, filters.maxPrice]);

  // Toggle hiển thị bộ lọc
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Xử lý lọc theo khoảng giá
  const handlePriceChange = (values) => {
    setPriceRange(values);
  };

  // Áp dụng lọc giá khi thả thanh trượt
  const handlePriceAfterChange = (values) => {
    onFilterChange('minPrice', values[0]);
    onFilterChange('maxPrice', values[1]);
  };

  // Cột cho bảng sản phẩm
  const columns = useMemo(
    () => [
      {
        title: 'STT',
        dataIndex: 'index',
        key: 'index',
        align: 'center',
        width: 60,
        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
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
    [currentPage, pageSize, filters.isActive]
  );

  // Xử lý sự kiện khi table thay đổi (filters, sorter)
  const handleTableChange = (pagination, tableFilters, sorter) => {
    // Xử lý sắp xếp
    if (sorter && sorter.order) {
      // Xác định loại sắp xếp dựa trên field và order
      let newSortType;

      switch (sorter.field) {
        case 'name':
          newSortType = sorter.order === 'ascend' ? 'name_asc' : 'name_desc';
          break;
        case 'price':
          newSortType = sorter.order === 'ascend' ? 'price_asc' : 'price_desc';
          break;
        case 'salesCount':
          newSortType = 'top_sales';
          break;
        case 'averageRating':
          newSortType = 'rating';
          break;
        default:
          newSortType = sorter.order === 'ascend' ? 'createdAt_asc' : 'latest';
      }

      onSortChange(newSortType);
    }

    // Xử lý các filter từ Table
    if (tableFilters) {
      // Xử lý filter danh mục
      if (tableFilters.category && tableFilters.category.length > 0) {
        onFilterChange('category', tableFilters.category[0]);
      } else if (tableFilters.category && tableFilters.category.length === 0) {
        onFilterChange('category', null);
      }

      // Xử lý filter stock
      if (tableFilters.inStock && tableFilters.inStock.length > 0) {
        onFilterChange('inStock', tableFilters.inStock[0] === 'true');
      } else if (tableFilters.inStock && tableFilters.inStock.length === 0) {
        onFilterChange('inStock', false);
      }

      // Xử lý filter isActive
      if (tableFilters.isActive && tableFilters.isActive.length > 0) {
        onFilterChange('isActive', tableFilters.isActive[0] === 'true');
      } else if (tableFilters.isActive && tableFilters.isActive.length === 0 && filters.isActive !== undefined) {
        onFilterChange('isActive', true); // Reset về mặc định true
      }

      // Xử lý filter brand
      if (tableFilters.brand && tableFilters.brand.length > 0) {
        onFilterChange('brand', tableFilters.brand);
      } else if (tableFilters.brand && tableFilters.brand.length === 0) {
        onFilterChange('brand', []);
      }
    }
  };

  // Xử lý chọn row
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  // Tạo danh sách thương hiệu duy nhất từ sản phẩm
  const uniqueBrands = !loading && products.length > 0 ? [...new Set(products.map((product) => product.brand))] : [];

  // Tạo danh sách màu sắc và kích thước duy nhất từ các biến thể sản phẩm
  const getUniqueVariantValues = (field) => {
    if (loading || products.length === 0) return [];

    const allValues = products.flatMap((product) => product.variants.map((variant) => variant[field]));

    return [...new Set(allValues)];
  };

  const uniqueColors = getUniqueVariantValues('color');
  const uniqueSizes = getUniqueVariantValues('size');
  console.log('uniqueColors', uniqueColors);
  console.log('uniqueSizes', uniqueSizes);

  // Tính tổng số bộ lọc đang được áp dụng
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.colors) count++;
    if (filters.sizes) count++;
    if (filters.featured) count++;
    if (filters.inStock) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

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
          {/* Nút toggle hiển thị bộ lọc */}
          <Button
            icon={<Filter size={16} />}
            onClick={toggleFilterPanel}
            type={isFilterOpen ? 'default' : 'dashed'}
            className='flex items-center'
          >
            Bộ lọc{' '}
            {Object.values(filters).some(
              (value) =>
                (Array.isArray(value) && value.length > 0) ||
                (value !== null && value !== undefined && value !== false && value !== '' && value !== true)
            ) ? (
              <span className='ml-1 text-xs'>(đang áp dụng)</span>
            ) : null}
          </Button>
        </div>

        {/* Ô tìm kiếm sản phẩm */}
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm kiếm sản phẩm...'
            prefix={<Search size={16} color='#999' />}
            value={searchText}
            onChange={onSearchChange}
            style={{ width: 250 }}
            allowClear
          />

          {/* Dropdown sắp xếp */}
          <Select placeholder='Sắp xếp theo' value={sortType} onChange={onSortChange} style={{ width: 180 }}>
            <Option value='latest'>Mới nhất</Option>
            <Option value='popular'>Phổ biến</Option>
            <Option value='top_sales'>Bán chạy</Option>
            <Option value='price_asc'>Giá tăng dần</Option>
            <Option value='price_desc'>Giá giảm dần</Option>
            <Option value='rating'>Đánh giá</Option>
          </Select>
        </div>
      </div>

      {/* Panel bộ lọc mở rộng */}
      {isFilterOpen && (
        <div className='mb-4 rounded-md border border-gray-200 bg-gray-50 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='text-lg font-medium'>Bộ lọc nâng cao</h3>
            <Button type='text' onClick={onClearFilters}>
              Xóa bộ lọc
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {/* Lọc theo danh mục */}
            <div>
              <h4 className='mb-2 font-medium'>Danh mục</h4>
              <Select
                placeholder='Chọn danh mục'
                style={{ width: '100%' }}
                value={filters.category}
                onChange={(value) => onFilterChange('category', value)}
                allowClear
              >
                {/* {facets?.categories?.map((cat) => (
                  <Option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.count})
                  </Option>
                ))} */}
              </Select>
            </div>

            {/* Lọc theo khoảng giá */}
            <div>
              <h4 className='mb-2 font-medium'>Khoảng giá</h4>
              <Slider
                range
                min={0}
                max={10000000}
                value={priceRange}
                onChange={handlePriceChange}
                onAfterChange={handlePriceAfterChange}
                tipFormatter={(value) => `${formatCurrency(value)}`}
              />
              <div className='flex items-center justify-between'>
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
            </div>

            {/* Các bộ lọc khác */}
            <div>
              <h4 className='mb-2 font-medium'>Trạng thái</h4>
              <div className='flex flex-col gap-1'>
                <Checkbox
                  checked={filters.inStock === true}
                  onChange={() => onToggleFilterValue('inStock', !filters.inStock)}
                >
                  Chỉ hiện sản phẩm còn hàng
                </Checkbox>
                <Checkbox
                  checked={filters.featured === true}
                  onChange={() => onToggleFilterValue('featured', !filters.featured)}
                >
                  Sản phẩm nổi bật
                </Checkbox>
                <Checkbox
                  checked={filters.isActive === true}
                  onChange={() => onFilterChange('isActive', !filters.isActive)}
                >
                  Chỉ hiện sản phẩm đang hoạt động
                </Checkbox>
              </div>
            </div>

            {/* Lọc theo size */}
            {uniqueSizes && uniqueSizes.length > 0 && (
              <div>
                <h4 className='mb-2 font-medium'>Kích thước</h4>
                <div className='flex max-h-40 flex-wrap gap-1 overflow-y-auto'>
                  {uniqueSizes.map((size) => (
                    <Tag
                      key={size}
                      color={filters.size?.includes(size) ? 'blue' : 'default'}
                      className='cursor-pointer'
                      onClick={() => onToggleFilterValue('size', size)}
                    >
                      {size} ({size?.count})
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Lọc theo màu sắc */}
            {uniqueColors && uniqueColors.length > 0 && (
              <div>
                <h4 className='mb-2 font-medium'>Màu sắc</h4>
                <div className='flex max-h-40 flex-wrap gap-1 overflow-y-auto'>
                  {uniqueColors.map((color) => (
                    <Tag
                      key={color}
                      color={filters.color?.includes(color) ? 'blue' : 'default'}
                      className='cursor-pointer'
                      onClick={() => onToggleFilterValue('color', color)}
                    >
                      {color} ({color?.count})
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Đánh giá */}
            <div>
              <h4 className='mb-2 font-medium'>Đánh giá</h4>
              <Select
                placeholder='Chọn đánh giá'
                style={{ width: '100%' }}
                value={filters.rating}
                onChange={(value) => onFilterChange('rating', value)}
                allowClear
              >
                <Option value={5}>5 sao</Option>
                <Option value={4}>Từ 4 sao</Option>
                <Option value={3}>Từ 3 sao</Option>
                <Option value={2}>Từ 2 sao</Option>
                <Option value={1}>Từ 1 sao</Option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Bảng danh sách sản phẩm */}
      <Table
        rowKey='_id'
        className='product-table rounded-lg border bg-white'
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={products}
        pagination={false} // Tắt phân trang của antd, dùng component Pagination riêng
        loading={loading}
        onChange={handleTableChange}
        locale={{ emptyText: loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu' }}
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
      <div className='mt-4 flex flex-wrap items-center justify-between gap-2'>
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
      </div>
    </div>
  );
};

export default ProductTable;
