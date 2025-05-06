import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import { deleteCategory, fetchCategories } from '@/store/slices/categorySlice';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { Calendar, FolderOpen, FolderPlus, FolderTree } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CategoryForm from './CategoryForm';
import CategoryTable from './CategoryTable';

const CategoryPage = () => {
  console.log('page');
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Lấy tất cả danh mục từ server khi component được render
    dispatch(fetchCategories({ page: 1, limit: 100 })); // Lấy tất cả danh mục để phân tích thống kê
  }, [dispatch]);

  // Tính toán các thống kê về danh mục
  const categoryStats = useMemo(() => {
    if (!categories || categories.length === 0) {
      // Trả về giá trị mặc định nếu không có danh mục nào
      return {
        total: 0,
        active: 0,
        newToday: 0,
        parentCategories: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: categories.length, // Tổng số danh mục
      active: categories.filter((cat) => cat.isActive).length, // Số danh mục đang hoạt động
      // Đếm số danh mục được tạo hôm nay
      newToday: categories.filter((cat) => {
        const createdAt = new Date(cat.createdAt);
        createdAt.setHours(0, 0, 0, 0);
        return createdAt.getTime() === today.getTime();
      }).length,
      // Đếm số danh mục gốc (không có danh mục cha)
      parentCategories: categories.filter((cat) => !cat.parentId).length
    };
  }, [categories]);

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
  };

  // Các handlers được định nghĩa ở component cha và truyền xuống component con
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleRefresh = () => {
    dispatch(fetchCategories({ page: 1, limit: 10 }));
  };

  const handleDeleteCategory = async (id) => {
    const resultAction = await dispatch(deleteCategory(id));
    if (deleteCategory.fulfilled.match(resultAction)) {
      message.success('Xóa danh mục thành công!');
    } else if (deleteCategory.rejected.match(resultAction)) {
      console.log('hihi');
      message.error(resultAction?.payload?.message || 'Có lỗi xảy ra khi xóa danh mục');
    }
    console.log('error', error);
  };

  // Lọc danh mục dựa trên từ khóa tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!searchText) return categories;

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [categories, searchText]);

  // Hiển thị trạng thái loading khi đang tải dữ liệu
  if (loading && !categories.length) {
    return <div className='flex h-full items-center justify-center'>Đang tải danh mục...</div>;
  }

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='Categories Management' />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        {/* Phần hiển thị các thẻ thống kê */}
        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard name='Total Categories' icon={FolderTree} value={categoryStats.total} color='#6366F1' />
          <StatCard name='New Today' icon={FolderPlus} value={categoryStats.newToday} color='#10B981' />
          <StatCard name='Active Categories' icon={FolderOpen} value={categoryStats.active} color='#F59E0B' />
          <StatCard name='Parent Categories' icon={Calendar} value={categoryStats.parentCategories} color='#8B5CF6' />
        </motion.div>

        {/* Phần bảng danh mục */}
        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CategoryTable
            categories={filteredCategories}
            loading={loading}
            searchText={searchText}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
            onDelete={handleDeleteCategory}
            onEdit={handleOpenFormEditCategory}
            onAdd={handleOpenFormAddCategory}
          />
        </motion.div>
      </main>
      {isOpenForm && (
        <CategoryForm
          categories={categories}
          loading={loading}
          selectedCategory={selectedCategory}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default memo(CategoryPage);
