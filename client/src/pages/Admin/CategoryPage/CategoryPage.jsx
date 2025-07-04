import AdminHeader from '@/components/AdminComponents/common/AdminHeader';
import useDebounce from '@/hooks/useDebounce';
import { deleteCategory, fetchCategories, getCategoriesTree } from '@/store/slices/categorySlice';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CategoryForm from './CategoryForm';
import CategoryTable from './CategoryTable';
const CategoryPage = () => {
  const dispatch = useDispatch();
  const { loading, treeLoading, error, pagination, filters } = useSelector((state) => state.category);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortInfo, setSortInfo] = useState({
    field: 'createdAt',
    order: 'descend'
  });

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    dispatch(getCategoriesTree());
  }, [dispatch]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách danh mục: ${error.message}`);
    }
  }, [error]);

  const handleTableChange = (pagination, filters, sorter) => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || 'createdAt',
      sortOrder: sorter.order || 'descend'
    };

    // Lưu thông tin sort
    setSortInfo({
      field: params.sortBy,
      order: params.sortOrder
    });

    // fetchAllCategories(params);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleOpenFormEditCategory = (category) => {
    setSelectedCategory(category);
    setIsOpenForm(true);
  };

  const handleOpenFormAddCategory = () => {
    setSelectedCategory(null);
    setIsOpenForm(true);
  };

  const handleCloseForm = () => {
    setIsOpenForm(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      message.success('Xóa danh mục thành công');
      dispatch(fetchCategories());
    } catch (error) {
      console.error('Xóa danh mục thất bại:', error);
      message.error(`Xóa danh mục thất bại. Vui lòng thử lại sau.`);
    }
  };
  const handleRefresh = () => {
    dispatch(getCategoriesTree());
  };

  useEffect(() => {
    document.title = 'Danh mục | Outfitory';
  }, []);

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <AdminHeader title='Quản lý danh mục' />

      <main className='mx-auto px-4 py-6 lg:px-8'>
        {/* Phần bảng danh mục */}
        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CategoryTable
            onRefresh={handleRefresh}
            pagination={pagination}
            onChange={handleTableChange}
            onSearch={handleSearch}
            searchText={searchText}
            onAdd={handleOpenFormAddCategory}
            onEdit={handleOpenFormEditCategory}
            onDelete={handleDeleteCategory}
            filters={filters}
          />
        </motion.div>
      </main>
      {isOpenForm && <CategoryForm selectedCategory={selectedCategory} onClose={handleCloseForm} />}
    </div>
  );
};

export default memo(CategoryPage);
