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
  const { products, loading, pagination, error } = useSelector((state) => state.product);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [sortInfo, setSortInfo] = useState({
    sortType: 'latest', // Mặc định sắp xếp theo mới nhất
    field: 'createdAt',
    order: 'descend'
  });

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

  // Áp dụng debounce cho search để tránh gọi API quá nhiều
  const debouncedSearchText = useDebounce(searchText, 500);
  const debouncedMinPrice = useDebounce(minPrice, 800);
  const debouncedMaxPrice = useDebounce(maxPrice, 800);

  // Tạo params cho API từ state
  const fetchAllProducts = useCallback(
    (params = {}) => {
      const queryParams = {
        page: params.page || pagination.page || 1,
        limit: params.limit || pagination.limit || 10,
        search: params.search !== undefined ? params.search : debouncedSearchText,
        sortBy: params.sortBy || sortInfo.field,
        sortOrder: params.sortOrder === 'ascend' ? 'asc' : 'desc',
        category: params.category,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
        size: params.size,
        color: params.color,
        rating: params.rating,
        tags: params.tags,
        inStock: params.inStock || undefined,
        featured: params.featured || undefined,
        isActive: params.isActive
      };

      // Xử lý sắp xếp dựa vào sortType
      if (sortInfo.sortType) {
        switch (sortInfo.sortType) {
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
            params.sort = sortInfo.sortBy;
            params.order = sortInfo.order;
        }
      }

      // Loại bỏ các tham số undefined
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });
      console.log('quaryParams', queryParams);
      // // Xử lý trường hợp có nhiều giá trị isActive (mảng)
      // if (Array.isArray(queryParams.isActive) && queryParams.isActive.length === 2) {
      //   // Nếu chọn cả "active" và "inactive", không cần lọc theo trạng thái
      //   delete queryParams.isActive;
      // }

      dispatch(fetchProducts(queryParams));
    },
    [dispatch, pagination.page, pagination.limit, debouncedSearchText, sortInfo.field]
  );

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách sản phẩm: ${error}`);
    }
  }, [error]);

  const handleTableChange = (pagination, filters, sorter) => {
    console.log('filters', filters);
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || 'createdAt',
      sortOrder: sorter.order || 'descend',
      status: filters.status ? filters.status : undefined,
      paymentStatus: filters['payment.isPaid'] ? filters['payment.isPaid'] : undefined,
      paymentMethod: filters['payment.method'] ? filters['payment.method'] : undefined
    };

    // Lưu giá trị filters vào Redux và state
    dispatch(
      setFilters({
        status: params.status,
        paymentStatus: params.paymentStatus,
        paymentMethod: params.paymentMethod
      })
    );

    // Lưu thông tin filters hiện tại để có thể đặt lại sau này
    setFilteredInfo(filters);

    // Lưu thông tin sort
    setSortInfo({
      field: params.sortBy,
      order: params.sortOrder
    });
    console.log('paymentStatus', params.paymentStatus);

    fetchAllOrders(params);
  };

  const handleRefresh = useCallback(() => {
    fetchProducts();
  }, []);

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
            pagination={pagination}
            onChange={handleTableChange}
            onSearch={handleSearch}
            searchText={searchText}
            loading={loading}
            onRefresh={handleRefresh}
            onDelete={handleDeleteProduct}
            onEdit={handleOpenFormEditProduct}
            onAdd={handleOpenFormAddProduct}
            filters={filters}
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
