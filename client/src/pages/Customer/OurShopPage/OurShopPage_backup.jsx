import countdownBanner2 from '@/assets/images/countdownBanner2.jpeg';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import CountDownBanner from '@/components/common/CountDownBanner/CountDownBanner';
import Select from '@/components/common/Select/Select';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import { fetchProducts, setFilters, setSortType } from '@/store/slices/productSlice';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FilterOutlined,
  SearchOutlined,
  CloseOutlined,
  TagOutlined,
  StarFilled,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';
import Button from '@/components/common/Button/Button';
import { colorOptions, sizeOptions } from '@/constants/colors';
import { fetchCategories } from '@/store/slices/categorySlice';

function OurShopPage() {
  const dispatch = useDispatch();
  const { products, loading, pagination, sort } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'list'
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Tùy chọn sắp xếp
  const sortOptions = [
    { label: 'Mặc định', value: 'default' },
    { label: 'Sản phẩm bán chạy nhất', value: 'popular' },
    { label: 'Sản phẩm mới nhất', value: 'latest' },
    { label: 'Giá từ thấp đến cao', value: 'price_asc' },
    { label: 'Giá từ cao đến thấp', value: 'price_desc' },
    { label: 'Đánh giá cao nhất', value: 'rating' }
  ];

  const breadcrumbItems = [{ label: 'Trang chủ', link: '/' }, { label: 'Sản phẩm' }];

  // Hàm xây dựng các tham số cho API
  const buildApiParams = useCallback(() => {
    return {
      search: searchTerm,
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      minPrice: priceRange.min || undefined,
      maxPrice: priceRange.max || undefined,
      color: selectedColors.length > 0 ? selectedColors : undefined,
      size: selectedSizes.length > 0 ? selectedSizes : undefined,
      rating: selectedRating || undefined,
      sortBy: sort?.sortBy,
      sortOrder: sort?.sortOrder
    };
  }, [searchTerm, selectedCategories, selectedColors, selectedSizes, priceRange, selectedRating, sort]);

  // Hàm xử lý thay đổi trang
  const handlePageChange = useCallback(
    (page) => {
      dispatch(
        fetchProducts({
          page,
          limit: pagination?.limit || 12,
          ...buildApiParams()
        })
      );
    },
    [dispatch, pagination?.limit, buildApiParams]
  );

  // Hàm xử lý áp dụng bộ lọc
  const handleApplyFilter = () => {
    const params = {
      page: 1,
      limit: pagination?.limit || 12,
      ...buildApiParams()
    };

    // Update filters in Redux
    dispatch(
      setFilters({
        search: searchTerm,
        category: selectedCategories,
        minPrice: priceRange.min || null,
        maxPrice: priceRange.max || null,
        color: selectedColors,
        size: selectedSizes,
        rating: selectedRating
      })
    );

    console.log('params', params);
    // Loại bỏ các tham số undefined
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });
    // Fetch products with new filters
    dispatch(fetchProducts(params));

    // Close filter sidebar on mobile
    if (window.innerWidth < 768) {
      setIsFilterOpen(false);
    }
  };

  // Hàm xử lý reset bộ lọc
  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedRating(0);

    dispatch(
      fetchProducts({
        page: 1,
        limit: pagination?.limit || 12
      })
    );
  };

  // Hàm xử lý thay đổi sắp xếp
  const handleSortChange = (value) => {
    dispatch(setSortType(value));

    dispatch(
      fetchProducts({
        page: 1,
        limit: pagination?.limit || 12,
        ...buildApiParams(),
        sortBy:
          value === 'default'
            ? 'createdAt'
            : value === 'popular'
              ? 'popularity'
              : value === 'latest'
                ? 'createdAt'
                : value.includes('price')
                  ? 'price'
                  : 'rating',
        sortOrder: value === 'price_asc' ? 'asc' : 'desc'
      })
    );
  };

  // Hàm toggle chọn danh mục
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  // Hàm toggle chọn màu sắc
  const toggleColor = (colorId) => {
    setSelectedColors((prev) => (prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]));
  };

  // Hàm toggle chọn kích thước
  const toggleSize = (sizeId) => {
    setSelectedSizes((prev) => (prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]));
  };

  // Fetch products khi component mount
  useEffect(() => {
    dispatch(
      fetchProducts({
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
    );
    dispatch(
      fetchCategories({
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
    );
  }, [dispatch]); // Add view transition animation
  useEffect(() => {
    document.body.style.transition = '0.3s opacity ease-in-out';
  }, []);

  // Render stars for rating selector
  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <button
        key={index}
        className={`cursor-pointer ${index < selectedRating ? 'text-yellow-400' : 'text-gray-300'}`}
        onClick={() => setSelectedRating(index + 1)}
      >
        <StarFilled />
      </button>
    ));
  };

  return (
    <div className='mx-auto w-full max-w-[1280px] pt-[60px] lg:pt-[80px]'>
      {/* Breadcrumb */}
      <div className='my-5'>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Banner */}
      <div className='mb-8 h-[280px] w-full'>
        <CountDownBanner backgroundImage={countdownBanner2} />
      </div>

      {/* Main content */}
      <div className='flex flex-col gap-6 lg:flex-row'>
        {/* Filter sidebar - Mobile Toggle */}
        <div className='mb-4 flex items-center justify-between lg:hidden'>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 transition hover:bg-gray-200'
          >
            <FilterOutlined /> {isFilterOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 ${viewMode === 'grid' ? 'bg-[#F3F4F6]' : 'bg-white'}`}
              aria-label='Grid view'
            >
              <AppstoreOutlined />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 ${viewMode === 'list' ? 'bg-[#F3F4F6]' : 'bg-white'}`}
              aria-label='List view'
            >
              hihi
              <BarsOutlined />
            </button>
          </div>
        </div>

        {/* Filter sidebar */}
        <div
          className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden'} fixed left-0 top-0 z-50 h-full w-4/5 transform transition-transform duration-300 ease-in-out lg:static lg:block lg:h-auto lg:w-1/4 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        >
          {/* Mobile close button */}
          <div className='mb-4 flex items-center justify-between lg:hidden'>
            <h2 className='text-lg font-semibold'>Bộ lọc</h2>
            <button className='rounded-full p-1 hover:bg-gray-100' onClick={() => setIsFilterOpen(false)}>
              <CloseOutlined />
            </button>
          </div>
          {/* Filter title - desktop */}
          <div className='mb-4 hidden lg:block'>
            <h2 className='text-lg font-semibold'>Bộ lọc sản phẩm</h2>
          </div>
          {/* Search */}
          <div className='mb-6'>
            <h3 className='text-md mb-2 font-medium'>Tìm kiếm</h3>
            <div className='relative'>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Nhập từ khóa...'
                className='focus:ring-primary-300 w-full rounded-md border border-gray-300 p-2.5 pl-10 focus:outline-none focus:ring-2'
              />
              <span className='absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400'>
                <SearchOutlined />
              </span>
            </div>
          </div>{' '}
          {/* Categories */}
          <div className='mb-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-md mb-2 font-medium'>Danh mục</h3>
              {selectedCategories.length > 0 && (
                <button
                  className='text-primary-600 hover:text-primary-700 text-xs'
                  onClick={() => setSelectedCategories([])}
                >
                  Bỏ chọn
                </button>
              )}
            </div>
            <div className='space-y-2'>
              {categories.map((category) => (
                <div key={category._id} className='flex items-center'>
                  <input
                    type='checkbox'
                    id={`category-${category._id}`}
                    checked={selectedCategories.includes(category._id)}
                    onChange={() => toggleCategory(category._id)}
                    className='h-4 w-4 rounded border-gray-300 text-[#333] focus:ring-[#333]'
                  />
                  <p
                    htmlFor={`category-${category._id}`}
                    className='ml-2 flex-grow cursor-pointer text-sm text-gray-700 hover:text-[#333]'
                    onClick={() => toggleCategory(category._id)}
                  >
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Price range */}
          <div className='mb-6'>
            <h3 className='text-md mb-2 font-medium'>Khoảng giá</h3>
            <div className='flex items-center gap-2'>
              <div className='w-full'>
                <label htmlFor='min-price' className='sr-only'>
                  Giá thấp nhất
                </label>
                <input
                  id='min-price'
                  type='number'
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  placeholder='Từ'
                  min='0'
                  aria-label='Giá thấp nhất'
                  className='focus:ring-primary-300 focus:border-primary-400 w-full rounded-md border border-gray-300 p-2 focus:ring-2'
                />
              </div>
              <span className='text-gray-500'>-</span>
              <div className='w-full'>
                <label htmlFor='max-price' className='sr-only'>
                  Giá cao nhất
                </label>
                <input
                  id='max-price'
                  type='number'
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  placeholder='Đến'
                  min='0'
                  aria-label='Giá cao nhất'
                  className='focus:ring-primary-300 focus:border-primary-400 w-full rounded-md border border-gray-300 p-2 focus:ring-2'
                />
              </div>
            </div>
            {priceRange.min && priceRange.max && parseInt(priceRange.min) > parseInt(priceRange.max) && (
              <p className='mt-1 text-sm text-red-500'>Giá thấp nhất không thể lớn hơn giá cao nhất</p>
            )}
          </div>{' '}
          {/* Colors */}
          <div className='mb-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-md mb-2 font-medium'>Màu sắc</h3>
              {selectedColors.length > 0 && (
                <button className='text-xs text-gray-600 hover:text-primaryColor' onClick={() => setSelectedColors([])}>
                  Bỏ chọn
                </button>
              )}
            </div>
            <div className='flex flex-wrap gap-3'>
              {colorOptions.map((color, index) => {
                return (
                  <div key={index} className='group relative'>
                    <button
                      onClick={() => toggleColor(color.name)}
                      className={`h-6 w-6 transform rounded-full border transition hover:scale-125 ${selectedColors.includes(color.name) ? 'scale-125 border-[#333]' : 'border-gray-200'} `}
                      style={{ backgroundColor: color.hex }}
                      aria-label={color.name}
                      aria-pressed={selectedColors.includes(color.name)}
                    />
                    <div className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                      {color.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>{' '}
          {/* Sizes */}
          <div className='mb-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-md mb-2 font-medium'>Kích thước</h3>
              {selectedSizes.length > 0 && (
                <button className='text-xs text-gray-600 hover:text-primaryColor' onClick={() => setSelectedSizes([])}>
                  Bỏ chọn
                </button>
              )}
            </div>
            <div className='flex flex-wrap gap-2'>
              {sizeOptions.map((size) => (
                <button
                  key={size.value}
                  onClick={() => toggleSize(size.value)}
                  className={`flex h-8 w-8 items-center justify-center rounded-sm border text-xs transition ${
                    selectedSizes.includes(size.value)
                      ? 'border-[#333] font-medium'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } `}
                  aria-pressed={selectedSizes.includes(size.value)}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
          {/* Rating */}
          <div className='mb-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-md mb-2 font-medium'>Đánh giá</h3>
              {selectedRating > 0 && (
                <button className='text-xs text-gray-600 hover:text-primaryColor' onClick={() => setSelectedRating(0)}>
                  Bỏ chọn
                </button>
              )}
            </div>
            <div className='flex items-center text-xl'>{renderStars()}</div>
          </div>
          {/* Filter actions */}
          <div className='mt-6 flex gap-2'>
            <Button
              onClick={handleApplyFilter}
              className='hover:bg-primary-700 flex flex-1 items-center justify-center rounded border bg-primaryColor px-4 py-2 text-white transition'
              aria-label='Áp dụng bộ lọc'
            >
              <FilterOutlined className='mr-1' /> Áp dụng
            </Button>
            <button
              onClick={handleResetFilter}
              className='flex flex-1 items-center justify-center rounded bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200'
              aria-label='Đặt lại bộ lọc'
            >
              <CloseOutlined className='mr-1' /> Đặt lại
            </button>
          </div>
        </div>

        {/* Product listing */}
        <div className='lg:w-3/4'>
          {/* Toolbar */}
          <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='text-sm text-gray-600'>
              {pagination && (
                <p>
                  Hiển thị {products?.length || 0} trên {pagination.total || 0} sản phẩm
                </p>
              )}
            </div>

            <div className='flex items-center gap-4'>
              <div className='hidden items-center gap-2 lg:flex'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                  aria-label='Grid view'
                >
                  <AppstoreOutlined />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                  aria-label='List view'
                >
                  <BarsOutlined />
                </button>
              </div>

              <Select
                options={sortOptions}
                placeholder='Sắp xếp theo'
                className='w-[200px]'
                defaultValue='default'
                onChange={(e) => {
                  handleSortChange(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Products */}
          {loading ? (
            viewMode === 'grid' ? (
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className='animate-pulse rounded-md border border-gray-200 p-4 shadow-sm'>
                    <div className='mb-4 h-48 w-full rounded-md bg-gray-200'></div>
                    <div className='mb-2 h-4 w-3/4 rounded-md bg-gray-200'></div>
                    <div className='mb-4 h-4 w-1/2 rounded-md bg-gray-200'></div>
                    <div className='mb-2 h-6 w-1/3 rounded-md bg-gray-200'></div>
                    <div className='mt-2 flex items-center justify-between'>
                      <div className='h-8 w-1/4 rounded-md bg-gray-200'></div>
                      <div className='h-8 w-1/3 rounded-md bg-gray-200'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col gap-4'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className='flex animate-pulse flex-col overflow-hidden rounded-md border border-gray-200 md:flex-row'
                  >
                    <div className='h-60 bg-gray-200 md:h-48 md:w-1/3'></div>
                    <div className='p-4 md:w-2/3'>
                      <div className='mb-3 h-6 w-3/4 rounded-md bg-gray-200'></div>
                      <div className='mb-4 h-4 w-1/2 rounded-md bg-gray-200'></div>
                      <div className='mb-2 h-4 w-full rounded-md bg-gray-200'></div>
                      <div className='mb-6 h-4 w-full rounded-md bg-gray-200'></div>
                      <div className='mt-2 flex items-center justify-between'>
                        <div className='h-8 w-1/4 rounded-md bg-gray-200'></div>
                        <div className='h-8 w-1/3 rounded-md bg-gray-200'></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : products && products.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {products.map((product) => (
                    <ProductCard key={product._id} item={product} />
                  ))}
                </div>
              ) : (
                <div className='flex flex-col gap-4'>
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className='flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md md:flex-row'
                    >
                      <div className='relative h-60 md:h-auto md:w-1/3'>
                        <img
                          src={product.thumbnail || product.images[0]}
                          alt={product.name}
                          className='h-full w-full object-cover'
                        />
                        {product.discount > 0 && (
                          <div className='absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white'>
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                      <div className='flex flex-col justify-between p-4 md:w-2/3'>
                        <div>
                          <h3 className='mb-2 text-lg font-semibold'>{product.name}</h3>
                          <div className='mb-2 flex items-center'>
                            <div className='flex text-yellow-400'>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <StarFilled
                                  key={i}
                                  className={
                                    i < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                  }
                                />
                              ))}
                            </div>
                            <span className='ml-2 text-sm text-gray-600'>({product.totalReviews || 0} đánh giá)</span>
                          </div>
                          <p className='mb-4 line-clamp-2 text-sm text-gray-600'>{product.description}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center'>
                            {product.discount > 0 && (
                              <span className='mr-2 text-gray-500 line-through'>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                  product.price
                                )}
                              </span>
                            )}
                            <span className='text-primary-600 text-lg font-bold'>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
                              )}
                            </span>
                          </div>
                          <button className='bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 text-white transition'>
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className='mt-8 flex justify-center'>
                  <nav aria-label='Phân trang'>
                    <ul className='flex items-center space-x-2'>
                      <li>
                        <button
                          onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                          disabled={pagination.page === 1}
                          aria-label='Trang trước'
                          className={`flex items-center justify-center rounded-md px-3 py-2 transition ${
                            pagination.page === 1
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                              : 'hover:text-primary-600 bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          &laquo;
                        </button>
                      </li>

                      {Array.from({ length: pagination.totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        // Show only 5 pages and add ellipsis
                        if (
                          pageNumber === 1 ||
                          pageNumber === pagination.totalPages ||
                          (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                        ) {
                          return (
                            <li key={pageNumber}>
                              <button
                                onClick={() => handlePageChange(pageNumber)}
                                aria-label={`Trang ${pageNumber}`}
                                aria-current={pageNumber === pagination.page ? 'page' : undefined}
                                className={`flex h-[40px] min-w-[40px] items-center justify-center rounded-md transition ${
                                  pageNumber === pagination.page
                                    ? 'bg-primary-600 font-medium text-white'
                                    : 'hover:text-primary-600 bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          );
                        } else if (
                          (pageNumber === 2 && pagination.page > 3) ||
                          (pageNumber === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                        ) {
                          return (
                            <li key={pageNumber} className='flex items-center'>
                              <span className='text-gray-500'>...</span>
                            </li>
                          );
                        }
                        return null;
                      })}

                      <li>
                        <button
                          onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                          disabled={pagination.page === pagination.totalPages}
                          aria-label='Trang sau'
                          className={`flex items-center justify-center rounded-md px-3 py-2 transition ${
                            pagination.page === pagination.totalPages
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                              : 'hover:text-primary-600 bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className='animate-fade-in flex flex-col items-center justify-center rounded-lg bg-gray-50 py-16'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                <TagOutlined style={{ fontSize: 32 }} className='text-gray-300' />
              </div>
              <h3 className='mb-2 text-xl font-medium text-gray-700'>Không tìm thấy sản phẩm</h3>
              <p className='mb-3 max-w-md text-center text-gray-500'>
                Không có sản phẩm nào phù hợp với bộ lọc hiện tại. Vui lòng thử lại với các tiêu chí khác.
              </p>
              <div className='mt-2 flex gap-3'>
                <button
                  onClick={handleResetFilter}
                  className='bg-primary-600 hover:bg-primary-700 flex items-center rounded-md px-4 py-2 text-white transition'
                  aria-label='Xóa tất cả bộ lọc'
                >
                  <CloseOutlined className='mr-1' /> Xóa bộ lọc
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className='rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300'
                >
                  Quay lại đầu trang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OurShopPage;
