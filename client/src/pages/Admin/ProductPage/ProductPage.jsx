import AdminHeader from '@/components/AdminComponents/common/AdminHeader';
import useDebounce from '@/hooks/useDebounce';
import ProductFilter from '@/pages/admin/ProductPage/ProductFilter';
import ProductSort from '@/pages/admin/ProductPage/ProductSort';
import {
  deleteProductById,
  fetchProducts,
  resetFilter,
  setFilter,
  setLimit,
  setPage,
  setSort
} from '@/store/slices/adminProductSlice';
import { Card, message } from 'antd';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';

const ProductPage = () => {
  const dispatch = useDispatch();
  const { products, pagination, filters, sort, loading, error } = useSelector((state) => state.adminProduct);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState('');

  const debouncedSearchText = useDebounce(searchText, 500);

  const fetchAllProducts = useCallback(() => {
    const queryParams = {
      page: pagination.page || 1,
      limit: pagination.limit || 5,
      search: debouncedSearchText || '',
      sortBy: sort.sortBy || 'createdAt',
      sortOrder: sort.sortOrder || 'desc',
      ...filters
    };

    // Loại bỏ các tham số undefined
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
        delete queryParams[key];
      }
    });

    dispatch(fetchProducts(queryParams));
  }, [pagination.page, pagination.limit, filters, debouncedSearchText, sort, dispatch]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handlePageChange = (page, pageSize) => {
    dispatch(setPage(page));
    if (pageSize !== pagination.limit) {
      dispatch(setLimit(pageSize));
    }
  };

  const handleSortChange = (newSortOption) => {
    switch (newSortOption) {
      case 'default':
        dispatch(setSort({ sortBy: 'createdAt', sortOrder: 'desc' }));
        break;
      case 'popular':
        dispatch(setSort({ sortBy: 'popular', sortOrder: 'desc' }));
        break;
      case 'latest':
        dispatch(setSort({ sortBy: 'createdAt', sortOrder: 'desc' }));
        break;
      case 'price_asc':
        dispatch(setSort({ sortBy: 'price', sortOrder: 'asc' }));
        break;
      case 'price_desc':
        dispatch(setSort({ sortBy: 'price', sortOrder: 'desc' }));
        break;
      case 'name_asc':
        dispatch(setSort({ sortBy: 'name', sortOrder: 'asc' }));
        break;
      case 'name_desc':
        dispatch(setSort({ sortBy: 'name', sortOrder: 'desc' }));
        break;
      case 'rating_desc':
        dispatch(setSort({ sortBy: 'rating', sortOrder: 'desc' }));
        break;
      default:
        dispatch(setSort({ sortBy: 'createdAt', sortOrder: 'desc' }));
        break;
    }
  };

  const handleFilterChange = (newFilters) => {
    // Reset về trang 1 khi áp dụng bộ lọc mới
    dispatch(setPage(1));
    dispatch(setFilter(newFilters));
  };

  const handleResetFilter = () => {
    dispatch(setPage(1));
    dispatch(resetFilter());
  };

  const handleRefresh = () => {
    fetchAllProducts();
  };

  const handleOpenForm = (product = null) => {
    setSelectedProduct(product);
    setIsOpenForm(true);
  };

  const handleCloseForm = () => {
    setIsOpenForm(false);
    setSelectedProduct(null);
  };

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

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách sản phẩm: ${error}`);
    }
  }, [error]);

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <AdminHeader title='Quản lý sản phẩm' />

      <main className='mx-auto px-4 py-6 lg:px-8'>
        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className='site-card-border-less-wrapper'>
            <Card className='card-shadow'>
              <ProductFilter onFilterChange={handleFilterChange} onResetFilter={handleResetFilter} />
              <ProductSort onSortChange={handleSortChange} />
            </Card>
          </div>

          <ProductTable
            searchText={searchText}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
            onDelete={handleDeleteProduct}
            onEdit={handleOpenForm}
            onAdd={handleOpenForm}
          />
        </motion.div>
      </main>

      {isOpenForm && <ProductForm selectedProduct={selectedProduct} onClose={handleCloseForm} />}
    </div>
  );
};
export default ProductPage;
