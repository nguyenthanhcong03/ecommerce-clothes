import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import { deleteCategory, fetchCategories, getCategoriesTree, setFilters } from '@/store/slices/categorySlice';
import { Button, message } from 'antd';
import { motion } from 'framer-motion';
import { Calendar, FolderOpen, FolderPlus, FolderTree } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CategoryForm from './CategoryForm';
import CategoryTable from './CategoryTable';
import useDebounce from '@/hooks/useDebounce';
const CategoryPage = () => {
  const dispatch = useDispatch();
  const { categories, loading, error, pagination, filters } = useSelector((state) => state.category);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortInfo, setSortInfo] = useState({
    field: 'createdAt',
    order: 'descend'
  });

  const debouncedSearchText = useDebounce(searchText, 500);

  // Tạo params cho API từ state
  // const fetchAllCategories = useCallback(
  //   (params = {}) => {
  //     const queryParams = {
  //       page: params.page || pagination.page || 1,
  //       limit: params.limit || pagination.limit || 10,
  //       search: params.search !== undefined ? params.search : debouncedSearchText,
  //       sortBy: params.sortBy || sortInfo.field,
  //       sortOrder: params.sortOrder === 'ascend' ? 'asc' : 'desc'
  //     };

  //     // // Xử lý trường hợp có nhiều giá trị isActive (mảng)
  //     // if (Array.isArray(queryParams.isActive) && queryParams.isActive.length === 2) {
  //     //   // Nếu chọn cả "active" và "inactive", không cần lọc theo trạng thái
  //     //   delete queryParams.isActive;
  //     // }

  //     dispatch(fetchCategories(queryParams));
  //   },
  //   [dispatch, pagination.page, pagination.limit, debouncedSearchText, sortInfo.field]
  // );

  // useEffect(() => {
  //   fetchAllCategories();
  // }, []);

  const fetchCategoriesTree = useCallback(
    (params = {}) => {
      const queryParams = {
        // page: params.page || pagination.page || 1,
        // limit: params.limit || pagination.limit || 10,
        // search: params.search !== undefined ? params.search : debouncedSearchText
        // sortBy: params.sortBy || sortInfo.field,
        // sortOrder: params.sortOrder === 'ascend' ? 'asc' : 'desc'
      };

      // // Xử lý trường hợp có nhiều giá trị isActive (mảng)
      // if (Array.isArray(queryParams.isActive) && queryParams.isActive.length === 2) {
      //   // Nếu chọn cả "active" và "inactive", không cần lọc theo trạng thái
      //   delete queryParams.isActive;
      // }

      dispatch(getCategoriesTree(queryParams));
    },
    [dispatch, pagination.page, pagination.limit, debouncedSearchText, sortInfo.field]
  );

  useEffect(() => {
    fetchCategoriesTree();
  }, []);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách danh mục: ${error.message}`);
    }
  }, [error]);

  // Handlers for table actions
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
    // Làm mới danh sách danh mục sau khi đóng form
    // fetchAllCategories();
  };
  const handleDeleteCategory = async (id) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      message.success('Xóa danh mục thành công');
      fetchAllCategories(); // Sử dụng hàm fetchAllCategories đã định nghĩa thay vì gọi fetchCategories trực tiếp
    } catch (error) {
      message.error(`Lỗi khi xóa danh mục: ${error.message}`);
    }
  };
  const handleRefresh = () => {
    fetchAllCategories({ page: 1, limit: 10 }); // Sử dụng hàm fetchAllCategories đã định nghĩa
  };

  // Tính toán các thống kê về danh mục
  const categoryStats = useMemo(() => {
    if (!categories || categories.length === 0) {
      // Trả về giá trị mặc định nếu không có danh mục nào
      return {
        total: 0,
        newToday: 0,
        parentCategories: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: categories.length, // Tổng số danh mục
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

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='Quản lý danh mục' />

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
            categories={categories}
            loading={loading}
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
