import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import useDebounce from '@/hooks/useDebounce';
import {
  deleteProductById,
  fetchProducts,
  resetFilters,
  setFilter,
  setLimit,
  setPage
} from '@/store/slices/productSlice';
import { Card, message } from 'antd';
import { motion } from 'framer-motion';
import { Package, PackagePlus, Star, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';
import ProductFilter from '@/pages/admin/ProductPage/ProductFilter';
import ProductSort from '@/pages/admin/ProductPage/ProductSort';
import { set } from 'date-fns';

const ProductPage = () => {
  const dispatch = useDispatch();
  const { products, loading, pagination, filters, error } = useSelector((state) => state.product);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });

  // Áp dụng debounce cho search để tránh gọi API quá nhiều
  const debouncedSearchText = useDebounce(searchText, 500);

  const fetchAllProducts = useCallback(() => {
    const queryParams = {
      page: pagination.page || 1,
      limit: pagination.limit || 5,
      search: debouncedSearchText || '',
      sortBy: sortOption.sortBy || 'createdAt',
      sortOrder: sortOption.sortOrder || 'desc',
      ...filters
    };

    // Loại bỏ các tham số undefined
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });
    console.log('quaryParams', queryParams);

    dispatch(fetchProducts(queryParams));
  }, [pagination.page, pagination.limit, filters, debouncedSearchText, sortOption]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách sản phẩm: ${error}`);
    }
  }, [error]);

  const handlePageChange = (page, pageSize) => {
    dispatch(setPage(page));
    if (pageSize !== pagination.limit) {
      dispatch(setLimit(pageSize));
    }
  };

  const handleSortChange = (newSortOption) => {
    switch (newSortOption) {
      case 'default':
        setSortOption({ sortBy: 'createdAt', sortOrder: 'desc' });
        break;
      case 'popular':
        setSortOption({ sortBy: 'popular', sortOrder: 'desc' });
        break;
      case 'latest':
        setSortOption({ sortBy: 'createdAt', sortOrder: 'desc' });
        break;
      case 'price_asc':
        setSortOption({ sortBy: 'price', sortOrder: 'asc' });
        break;
      case 'price_desc':
        setSortOption({ sortBy: 'price', sortOrder: 'desc' });
        break;
      case 'name_asc':
        setSortOption({ sortBy: 'name', sortOrder: 'asc' });
        break;
      case 'name_desc':
        setSortOption({ sortBy: 'name', sortOrder: 'desc' });
        break;
      case 'rating_desc':
        setSortOption({ sortBy: 'rating', sortOrder: 'desc' });
        break;
      default:
        setSortOption({ sortBy: 'createdAt', sortOrder: 'desc' });
        break;
    }
  };

  const handleOpenForm = (product = null) => {
    setSelectedProduct(product);
    setIsOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedProduct(null);
    setIsOpenForm(false);
  };

  const handleFilterChange = (newFilters) => {
    // Reset về trang 1 khi áp dụng bộ lọc mới
    dispatch(setPage(1));
    dispatch(setFilter(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(setPage(1));
    dispatch(resetFilters());
    setSortOption({
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleRefresh = useCallback(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

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
      active: products.filter((product) => product?.isActive).length,
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
      <Header title='Quản lý sản phẩm' />

      <main className='mx-auto px-4 py-6 lg:px-8'>
        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className='site-card-border-less-wrapper'>
            <Card className='card-shadow'>
              <ProductFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
              <div className='mt-4'>
                <ProductSort sort={sortOption} onSortChange={handleSortChange} />
              </div>
            </Card>
          </div>

          <ProductTable
            products={products}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            searchText={searchText}
            onDelete={handleDeleteProduct}
            onEdit={handleOpenForm}
            onAdd={handleOpenForm}
            loading={loading}
            onRefresh={handleRefresh}
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
