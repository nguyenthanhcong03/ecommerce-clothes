import countdownBanner2 from '@/assets/images/countdownBanner2.jpeg';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import CountDownBanner from '@/components/common/CountDownBanner/CountDownBanner';
import Pagination from '@/components/common/Pagination/Pagination';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import ProductItem from '@/components/product/ProductItem/ProductItem';
import { CategorySidebar } from '@/pages/customer/OurShopPage/components/CategorySidebar';
import EmptyProduct from '@/pages/customer/OurShopPage/components/EmptyProduct';
import { FilterSidebar } from '@/pages/customer/OurShopPage/components/FilterSidebar';
import SortSection from '@/pages/customer/OurShopPage/components/SortSection';
import { fetchProducts } from '@/store/slices/shopSlice';
import { findCategoryById } from '@/utils/helpers/findCategoryById';
import { generateNameId, getIdFromNameId } from '@/utils/helpers/fn';
import { getCategoryPath } from '@/utils/helpers/getCategoryPath';
import { AppstoreOutlined, BarsOutlined, FilterOutlined } from '@ant-design/icons';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

const sortOptions = [
  { label: 'Mặc định', value: 'default' },
  { label: 'Giá: Thấp đến cao', value: 'price_asc' },
  { label: 'Giá: Cao đến thấp', value: 'price_desc' },
  { label: 'Tên: A-Z', value: 'name_desc' },
  { label: 'Tên: Z-A', value: 'name_asc' },
  { label: 'Mới nhất', value: 'latest' },
  { label: 'Bán chạy nhất', value: 'popular' },
  { label: 'Đánh giá cao', value: 'rating_desc' }
];

function OurShopPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, pagination } = useSelector((state) => state.shop);
  const { categoriesTree } = useSelector((state) => state.category);
  const { nameId } = useParams();
  const catId = getIdFromNameId(nameId);
  const [params, setParams] = useSearchParams();

  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const search = params.get('search') || '';

  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        label: 'Cửa hàng',
        path: '/shop'
      }
    ];

    if (catId && categoriesTree) {
      const categoryPath = getCategoryPath(categoriesTree, catId);
      const pathItems = categoryPath.map((cat, index) => ({
        label: cat.name,
        path: index === categoryPath.length - 1 ? null : `/shop/${generateNameId({ name: cat.name, id: cat._id })}`
      }));
      items.push(...pathItems);
    }

    if (search) {
      items.push({
        label: `Tìm kiếm: "${search}"`,
        path: null
      });
    }

    return items;
  }, [catId, categoriesTree, search]);

  // Lấy danh mục hiện tại dựa trên catId
  const currentCategory = useMemo(() => {
    if (!catId || !categoriesTree) return null;
    return findCategoryById(categoriesTree, catId);
  }, [catId, categoriesTree]);

  const handlePageChange = (page) => {
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page);
    }
    setParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortOption) => {
    switch (newSortOption) {
      case 'default':
        params.set('sortBy', 'createdAt');
        params.set('sortOrder', 'desc');
        break;
      case 'popular':
        params.set('sortBy', 'popular');
        params.set('sortOrder', 'desc');
        break;
      case 'latest':
        params.set('sortBy', 'createdAt');
        params.set('sortOrder', 'desc');
        break;
      case 'price_asc':
        params.set('sortBy', 'price');
        params.set('sortOrder', 'asc');
        break;
      case 'price_desc':
        params.set('sortBy', 'price');
        params.set('sortOrder', 'desc');
        break;
      case 'name_asc':
        params.set('sortBy', 'name');
        params.set('sortOrder', 'asc');
        break;
      case 'name_desc':
        params.set('sortBy', 'name');
        params.set('sortOrder', 'desc');
        break;
      case 'rating_desc':
        params.set('sortBy', 'rating');
        params.set('sortOrder', 'desc');
        break;
      default:
        params.set('sortBy', 'createdAt');
        params.set('sortOrder', 'desc');
        break;
    }
    params.delete('page');
    setParams(params);
  };

  const handleFilterChange = (name, value) => {
    // Xử lý theo từng loại filter
    switch (name) {
      case 'priceRange': {
        // Xử lý khoảng giá định sẵn
        if (value) {
          params.set('minPrice', value.min);
          if (value.max) {
            params.set('maxPrice', value.max);
          } else {
            params.delete('maxPrice');
          }
        } else {
          params.delete('minPrice');
          params.delete('maxPrice');
        }
        break;
      }

      case 'minPrice':
      case 'maxPrice': {
        // Xử lý giá tùy chỉnh
        if (value && value.trim() !== '') {
          params.set(name, value);
        } else {
          params.delete(name);
        }
        break;
      }

      case 'color':
      case 'size': {
        // Xử lý toggle cho colors và sizes
        const currentValues = params.get(name)?.split(',').filter(Boolean) || [];
        let newValues;

        if (currentValues.includes(value)) {
          // Xóa nếu đã tồn tại
          newValues = currentValues.filter((item) => item !== value);
        } else {
          // Thêm nếu chưa tồn tại
          newValues = [...currentValues, value];
        }

        if (newValues.length > 0) {
          params.set(name, newValues.join(','));
        } else {
          params.delete(name);
        }
        break;
      }

      case 'rating': {
        // Xử lý rating
        if (value && value > 0) {
          params.set('rating', value);
        } else {
          params.delete('rating');
        }
        break;
      }

      default: {
        // Xử lý chung cho các filter khác
        if (value && value.trim() !== '') {
          params.set(name, value);
        } else {
          params.delete(name);
        }
        break;
      }
    }

    params.delete('page'); // Reset về trang 1 và xóa khỏi URL
    setParams(params);
  };
  const handleResetFilter = () => {
    const newParams = new URLSearchParams();
    // Giữ lại search
    if (params.get('search')) newParams.set('search', params.get('search'));
    setParams(newParams);
  };

  const handleGoBack = () => {
    // Nếu có breadcrumb items và có ít nhất 2 items (Cửa hàng + current)
    if (breadcrumbItems.length >= 2) {
      const previousItem = breadcrumbItems[breadcrumbItems.length - 2];
      if (previousItem.path) {
        navigate(previousItem.path);
      } else {
        // Nếu không có path, trở về trang shop chính
        navigate('/shop');
      }
    } else {
      // Mặc định trở về trang shop chính
      navigate('/shop');
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    const queryParams = {
      search: params.get('search') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sortBy: params.get('sortBy') || 'createdAt',
      sortOrder: params.get('sortOrder') || 'desc',
      size: params.get('size')?.split(',') || '',
      color: params.get('color')?.split(',') || '',
      rating: params.get('rating') || '',
      category: catId || '',
      page: params.get('page') || 1,
      limit: 9
    };

    // // Remove undefined/empty values
    // Object.keys(queryParams).forEach((key) => !queryParams[key] && delete queryParams[key]);

    dispatch(fetchProducts(queryParams));
  }, [dispatch, catId, params]);

  useEffect(() => {
    document.title = 'Cửa hàng | Outfitory';
  }, []);

  return (
    <div className='pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb separator='/' items={breadcrumbItems} />
      </div>
      {/* Main content */}
      <div className='flex w-full flex-col gap-6 lg:flex-row'>
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
            onFilterChange={handleFilterChange}
            onResetFilter={handleResetFilter}
            params={params}
          />
        </div>

        {/* Mobile Filter Sidebar */}
        <div className='lg:hidden'>
          <FilterSidebar
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            onFilterChange={handleFilterChange}
            onResetFilter={handleResetFilter}
            params={params}
          />
        </div>

        {/* Main content */}
        <div className='lg:w-3/4'>
          {currentCategory ? (
            <div className='mb-4 flex items-center gap-2 rounded-md bg-white p-4'>
              <ChevronLeft
                className='cursor-pointer transition-colors hover:text-blue-600'
                onClick={handleGoBack}
                title='Trở về'
              />
              <h1 className='text-2xl font-bold'>{currentCategory.name}</h1>
            </div>
          ) : (
            search && (
              <div className='mb-4 text-center'>
                <h2 className='text-xl font-medium text-gray-600'>
                  Kết quả tìm kiếm cho &ldquo;{search}&rdquo; - {pagination?.total || 0} sản phẩm
                </h2>
              </div>
            )
          )}
          {!search && (
            <div className='mb-4 h-[280px] w-full rounded-md bg-white p-4'>
              <CountDownBanner backgroundImage={countdownBanner2} />
            </div>
          )}
          {!search && currentCategory?.children?.length > 0 && (
            <div className='mb-4 rounded-md bg-white p-4'>
              <h3>Khám phá theo danh mục</h3>
              <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                {currentCategory.children.map((category) => (
                  <Link
                    key={category._id}
                    to={`/shop/${generateNameId({ name: category.name, id: category._id })}`}
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
            onSortChange={handleSortChange}
            params={params}
          />
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
  );
}

export default OurShopPage;
