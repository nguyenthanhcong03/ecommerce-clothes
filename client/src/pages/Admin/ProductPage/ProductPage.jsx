import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
// import UserActivityHeatmap from '@/components/AdminComponents/users/UserActivityHeatmap';
// import UserDemographicsChart from '@/components/AdminComponents/users/UserDemographicsChart';
// import UserGrowthChart from '@/components/AdminComponents/users/UserGrowthChart';
import useDebounce from '@/hooks/useDebounce';
import { deleteProductById, fetchProducts } from '@/store/slices/productSlice';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { Package, PackagePlus, Star, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';

const ProductPage = () => {
  const dispatch = useDispatch();
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Lấy các state từ redux
  const { products, loading, pagination, error } = useSelector((state) => state.product);

  // Local state để quản lý bộ lọc, sắp xếp và phân trang
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    brand: [],
    minPrice: null,
    maxPrice: null,
    size: [],
    color: [],
    rating: null,
    tags: [],
    inStock: false,
    featured: false,
    isActive: true // Mặc định chỉ hiện sản phẩm đang hoạt động
  });

  const [sort, setSort] = useState({
    sortType: 'latest',
    sortBy: 'createdAt',
    order: 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Áp dụng debounce cho search để tránh gọi API quá nhiều
  const debouncedSearchText = useDebounce(filters.search, 500);
  const debouncedMinPrice = useDebounce(filters.minPrice, 800);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 800);

  // Tạo params cho API từ state với các giá trị đã debounce
  const apiParams = useMemo(() => {
    // Lọc ra các giá trị undefined và null
    const params = {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchText,
      category: filters.category,
      brand: filters.brand,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      size: filters.size,
      color: filters.color,
      rating: filters.rating,
      tags: filters.tags,
      inStock: filters.inStock || undefined,
      featured: filters.featured || undefined,
      isActive: filters.isActive
    };

    // Xử lý sắp xếp dựa vào sortType
    if (sort.sortType) {
      switch (sort.sortType) {
        case 'latest':
          params.sort = 'createdAt';
          params.order = 'desc';
          break;
        case 'popular':
          params.sort = 'viewCount';
          params.order = 'desc';
          break;
        case 'top_sales':
          params.sort = 'salesCount';
          params.order = 'desc';
          break;
        case 'price_asc':
          params.sort = 'price';
          params.order = 'asc';
          break;
        case 'price_desc':
          params.sort = 'price';
          params.order = 'desc';
          break;
        case 'rating':
          params.sort = 'averageRating';
          params.order = 'desc';
          break;
        default:
          params.sort = sort.sortBy;
          params.order = sort.order;
      }
    }

    // Loại bỏ các giá trị rỗng
    Object.keys(params).forEach((key) => {
      if (
        params[key] === null ||
        params[key] === undefined ||
        (Array.isArray(params[key]) && params[key].length === 0) ||
        params[key] === ''
      ) {
        delete params[key];
      }
    });

    return params;
  }, [
    currentPage,
    pageSize,
    debouncedSearchText,
    filters.category,
    filters.brand,
    debouncedMinPrice,
    debouncedMaxPrice,
    filters.size,
    filters.color,
    filters.rating,
    filters.tags,
    filters.inStock,
    filters.featured,
    filters.isActive,
    sort
  ]);

  // Function để fetch products - tách riêng để có thể gọi lại khi cần
  const fetchProductsData = useCallback(() => {
    dispatch(fetchProducts(apiParams));
  }, [dispatch, apiParams]);

  // Load sản phẩm khi params thay đổi
  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách sản phẩm: ${error}`);
    }
  }, [error]);

  // Các handlers cho các hành động lọc
  const handleSetFilter = useCallback((name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));

    // Reset về trang 1 khi thay đổi bộ lọc
    setCurrentPage(1);
  }, []);

  const handleToggleFilterValue = useCallback((name, value) => {
    setFilters((prev) => {
      // Xử lý cho các trường dạng mảng như brand, size, color
      if (Array.isArray(prev[name])) {
        const currentValues = [...prev[name]];
        const index = currentValues.indexOf(value);

        if (index !== -1) {
          // Nếu giá trị đã tồn tại thì xóa đi
          currentValues.splice(index, 1);
        } else {
          // Nếu giá trị chưa tồn tại thì thêm vào
          currentValues.push(value);
        }

        return {
          ...prev,
          [name]: currentValues
        };
      }
      // Xử lý cho các trường dạng boolean như inStock, featured
      else if (typeof prev[name] === 'boolean') {
        return {
          ...prev,
          [name]: !prev[name]
        };
      }

      // Trường hợp mặc định
      return prev;
    });

    // Reset về trang 1 khi thay đổi bộ lọc
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: null,
      brand: [],
      minPrice: null,
      maxPrice: null,
      size: [],
      color: [],
      rating: null,
      tags: [],
      inStock: false,
      featured: false,
      isActive: true // Giữ lại mặc định chỉ hiện sản phẩm đang hoạt động
    });
    setCurrentPage(1);
  }, []);

  const handleSetSortType = useCallback((sortType) => {
    setSort((prev) => ({
      ...prev,
      sortType
    }));
  }, []);

  const handleSetPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSetPageSize = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi số lượng item mỗi trang
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      const searchValue = e.target.value;
      handleSetFilter('search', searchValue);
    },
    [handleSetFilter]
  );

  const handleRefresh = useCallback(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  // Tính toán các thống kê về sản phẩm
  const productStats = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        totalProducts: pagination?.totalProducts || 0,
        active: 0,
        newToday: 0,
        featured: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalProducts: pagination?.totalProducts || 0, // Lấy tổng số từ pagination
      active: products.filter((product) => product.isActive).length,
      // Đếm số sản phẩm được tạo hôm nay
      newToday: products.filter((product) => {
        const createdAt = new Date(product.createdAt);
        createdAt.setHours(0, 0, 0, 0);
        return createdAt.getTime() === today.getTime();
      }).length,
      // Đếm số sản phẩm nổi bật
      featured: products.filter((product) => product.featured).length
    };
  }, [products, pagination]);

  const handleOpenFormEditProduct = useCallback((product) => {
    setSelectedProduct(product);
    setIsOpenForm(true);
  }, []);

  const handleOpenFormAddProduct = useCallback(() => {
    setSelectedProduct(null);
    setIsOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsOpenForm(false);
    handleRefresh();
  }, [handleRefresh]);

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = useCallback(
    async (id) => {
      try {
        const resultAction = await dispatch(deleteProductById({ productId: id }));
        if (deleteProductById.fulfilled.match(resultAction)) {
          message.success('Xóa sản phẩm thành công!');
          handleRefresh(); // Làm mới danh sách sản phẩm sau khi xóa
        } else if (deleteProductById.rejected.match(resultAction)) {
          message.error(resultAction?.payload?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        }
      } catch (error) {
        message.error('Có lỗi xảy ra khi xóa sản phẩm');
        console.error(error);
      }
    },
    [dispatch, handleRefresh]
  );

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='Products' />

      <main className='mx-auto px-4 py-6 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Tổng số sản phẩm' icon={Package} value={pagination?.totalProducts || 0} color='#6366F1' />
          <StatCard name='Sản phẩm mới hôm nay' icon={PackagePlus} value={productStats.newToday} color='#10B981' />
          <StatCard name='Sản phẩm đang hoạt động' icon={TrendingUp} value={productStats.active} color='#F59E0B' />
          <StatCard name='Sản phẩm nổi bật' icon={Star} value={productStats.featured} color='#EF4444' />
        </motion.div>

        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <ProductTable
            products={products}
            loading={loading}
            searchText={filters.search}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={pagination?.totalProducts || 0}
            totalPages={pagination?.totalPages || 0}
            sortType={sort.sortType}
            filters={filters}
            onPageChange={handleSetPage}
            onPageSizeChange={handleSetPageSize}
            onSearchChange={handleSearchChange}
            onSortChange={handleSetSortType}
            onFilterChange={handleSetFilter}
            onToggleFilterValue={handleToggleFilterValue}
            onClearFilters={handleClearFilters}
            onRefresh={handleRefresh}
            onDelete={handleDeleteProduct}
            onEdit={handleOpenFormEditProduct}
            onAdd={handleOpenFormAddProduct}
          />
        </motion.div>

        {/* USER CHARTS */}
        <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* <UserGrowthChart />
          <UserActivityHeatmap />
          <UserDemographicsChart /> */}
        </div>
      </main>
      {isOpenForm && <ProductForm loading={loading} selectedProduct={selectedProduct} onClose={handleCloseForm} />}
    </div>
  );
};
export default ProductPage;
