import countdownBanner2 from '@/assets/images/countdownBanner2.jpeg';
import CountDownBanner from '@/components/common/CountDownBanner/CountDownBanner';
import Pagination from '@/components/common/Pagination/Pagination';
import Select from '@/components/common/Select/Select';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import ProductItem from '@/components/product/ProductItem/ProductItem';
import useDebounce from '@/hooks/useDebounce';
import { CategorySidebar } from '@/pages/customer/OurShopPage/components/CategorySidebar';
import EmptyProduct from '@/pages/customer/OurShopPage/components/EmptyProduct';
import { FilterSidebar } from '@/pages/customer/OurShopPage/components/FilterSidebar';
import SortSection from '@/pages/customer/OurShopPage/components/SortSection';
import { fetchProducts } from '@/store/slices/productSlice';
import { findCategoryById } from '@/utils/findCategoryById';
import { AppstoreOutlined, BarsOutlined, FilterOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useSearchParams } from 'react-router-dom';

const sortOptions = [
  { label: 'Mặc định', value: 'default' },
  { label: 'Giá: Thấp đến cao', value: 'price_asc' },
  { label: 'Giá: Cao đến thấp', value: 'price_desc' },
  { label: 'Tên: A-Z', value: 'name_asc' },
  { label: 'Tên: Z-A', value: 'name_desc' },
  { label: 'Mới nhất', value: 'latest' },
  { label: 'Bán chạy nhất', value: 'popular' },
  { label: 'Đánh giá cao', value: 'rating_desc' }
];

function OurShopPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, pagination } = useSelector((state) => state.product);
  const { categoriesTree } = useSelector((state) => state.category);
  const { catId, slug } = useParams();

  // UI States
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || ''
  });
  const [selectedColors, setSelectedColors] = useState(searchParams.get('colors')?.split(',').filter(Boolean) || []);
  const [selectedSizes, setSelectedSizes] = useState(searchParams.get('sizes')?.split(',').filter(Boolean) || []);
  const [selectedRating, setSelectedRating] = useState(parseInt(searchParams.get('rating')) || 0);

  // Debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // Get current category info
  const currentCategory = useMemo(() => {
    if (!catId || !categoriesTree) return null;
    return findCategoryById(categoriesTree, catId);
  }, [catId, categoriesTree]);

  // Handle page change
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };
  // Handle sort change
  const handleSortChange = useCallback(
    (value) => {
      const newParams = new URLSearchParams(searchParams);

      switch (value) {
        case 'default':
          newParams.set('sortBy', 'createdAt');
          newParams.set('sortOrder', 'desc');
          break;
        case 'popular':
          newParams.set('sortBy', 'popularity');
          newParams.set('sortOrder', 'desc');
          break;
        case 'latest':
          newParams.set('sortBy', 'createdAt');
          newParams.set('sortOrder', 'desc');
          break;
        case 'price_asc':
          newParams.set('sortBy', 'price');
          newParams.set('sortOrder', 'asc');
          break;
        case 'price_desc':
          newParams.set('sortBy', 'price');
          newParams.set('sortOrder', 'desc');
          break;
        case 'name_asc':
          newParams.set('sortBy', 'name');
          newParams.set('sortOrder', 'asc');
          break;
        case 'name_desc':
          newParams.set('sortBy', 'name');
          newParams.set('sortOrder', 'desc');
          break;
        case 'rating_desc':
          newParams.set('sortBy', 'rating');
          newParams.set('sortOrder', 'desc');
          break;
        default:
          newParams.delete('sortBy');
          newParams.delete('sortOrder');
          break;
      }

      newParams.delete('page'); // Reset về trang 1 khi thay đổi sắp xếp
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Handle filter changes
  const handleFilterChange = (filters) => {
    const newParams = new URLSearchParams(searchParams);

    // Update each filter in URL params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (typeof value === 'string' || Array.isArray(value))) {
        if (Array.isArray(value) && value.length) {
          newParams.set(key, value.join(','));
        } else if (typeof value === 'string' && value.trim()) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      } else {
        newParams.delete(key);
      }
    });

    newParams.delete('page'); // Reset to first page when filters change
    setSearchParams(newParams);
  };

  // Reset all filters
  const handleResetFilter = () => {
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedRating(0);

    const newParams = new URLSearchParams();
    setSearchParams(newParams);
  };

  // Fetch products when filters change
  useEffect(() => {
    const params = {
      page: searchParams.get('page') || 1,
      limit: 12,
      category: catId,
      search: debouncedSearchTerm,
      minPrice: searchParams.get('minPrice') || debouncedPriceRange.min,
      maxPrice: searchParams.get('maxPrice') || debouncedPriceRange.max,
      color: searchParams.get('colors')?.split(',').filter(Boolean) || selectedColors,
      size: searchParams.get('sizes')?.split(',').filter(Boolean) || selectedSizes,
      rating: searchParams.get('rating') || selectedRating,
      sortBy: searchParams.get('sortBy') || 'default',
      sortOrder: searchParams.get('sortOrder') || 'asc'
    };

    // Remove undefined/empty values
    Object.keys(params).forEach((key) => !params[key] && delete params[key]);
    console.log('params', params);

    dispatch(fetchProducts(params));
  }, [
    dispatch,
    catId,
    debouncedSearchTerm,
    // debouncedPriceRange,
    // selectedColors,
    // selectedSizes,
    // selectedRating,
    searchParams
  ]);

  return (
    <div className='bg-[#F5F5FA]'>
      <div className='mx-auto w-full max-w-[1440px] p-8 pt-[60px] lg:pt-[80px]'>
        <div>Breadcrumb</div>
        {/* Main content */}
        <div className='flex flex-col gap-6 lg:flex-row'>
          {/* Mobile filters */}
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
                className={`rounded-md px-2 py-1 ${viewMode === 'grid' ? 'bg-[#F3F4F6]' : 'bg-white'}`}
                aria-label='Grid view'
              >
                <AppstoreOutlined />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md px-2 py-1 ${viewMode === 'list' ? 'bg-[#F3F4F6]' : 'bg-white'}`}
                aria-label='List view'
              >
                <BarsOutlined />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className='hidden lg:block lg:w-1/4'>
            <CategorySidebar />
            <FilterSidebar
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              onFilterChange={handleFilterChange}
              onResetFilter={handleResetFilter}
            />
          </div>

          {/* Mobile Filter Sidebar */}
          <div className='lg:hidden'>
            <FilterSidebar
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              onFilterChange={handleFilterChange}
              onResetFilter={handleResetFilter}
            />
          </div>

          {/* Main content */}
          <div className='lg:w-3/4'>
            <h1 className='mb-4 rounded-md bg-white p-4 text-[28px] font-bold'>{currentCategory?.name}</h1>
            <div className='mb-4 h-[280px] w-full'>
              <CountDownBanner backgroundImage={countdownBanner2} />
            </div>

            {currentCategory?.children?.length > 0 && (
              <div className='mb-4 rounded-md bg-white p-4'>
                <h3>Khám phá theo danh mục</h3>
                <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                  {currentCategory.children.map((category) => (
                    <Link
                      key={category._id}
                      to={`/shop/${category.slug}/${category._id}`}
                      className='flex flex-col items-center rounded-lg bg-white p-4 hover:opacity-90'
                    >
                      {category.images[0] && (
                        <img src={category.images[0]} alt={category.name} className='mb-3 h-16 w-16 object-contain' />
                      )}
                      <h3 className='text-sm font-medium text-gray-900'>{category.name}</h3>
                      {category.productsCount > 0 && (
                        <span className='mt-1 text-xs text-gray-500'>{category.productsCount} sản phẩm</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <SortSection
              currentCategory={currentCategory}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortOptions={sortOptions}
              searchParams={searchParams}
              onSortChange={handleSortChange}
            ></SortSection>

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
                  <div className='grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4'>
                    {products.map((product) => (
                      <ProductCard key={product._id} item={product} />
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col gap-4'>
                    {products.map((product) => (
                      <ProductItem key={product._id} product={product} />
                    ))}
                  </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                  <div className='mt-8 flex justify-center'>
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      className='mt-4'
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyProduct onResetFilter={handleResetFilter} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OurShopPage;
