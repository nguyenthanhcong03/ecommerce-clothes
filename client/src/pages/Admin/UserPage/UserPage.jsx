import AdminHeader from '@/components/AdminComponents/common/AdminHeader';
import useDebounce from '@/hooks/useDebounce';
import { Card, message } from 'antd';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BanUserModal from './BanUserModal';
import UserForm from './UserForm';
import UserTable from './UserTable';
import {
  banUser,
  deleteUser,
  fetchAllUsers,
  resetFilter,
  setFilter,
  setLimit,
  setPage,
  unbanUser
} from '@/store/slices/adminUserSlice';
import UserFilter from '@/pages/admin/UserPage/UserFilter';

const UserPage = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading, sort, error, filters } = useSelector((state) => state.adminUser);

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIdForBan, setSelectedUserIdForBan] = useState(null);
  const [isOpenBanModal, setIsOpenBanModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Áp dụng debounce cho search để tránh gọi API quá nhiều
  const debouncedSearchText = useDebounce(searchText, 500);

  // Tạo params cho API từ state
  const fetchUsers = useCallback(() => {
    const queryParams = {
      page: pagination.page || 1,
      limit: pagination.limit || 5,
      search: debouncedSearchText || '',
      role: filters.role || '',
      isBlocked: filters.isBlocked || null,
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

    dispatch(fetchAllUsers(queryParams));
  }, [dispatch, pagination.page, pagination.limit, filters, debouncedSearchText, sort]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handlePageChange = (page, pageSize) => {
    dispatch(setPage(page));
    if (pageSize !== pagination.limit) {
      dispatch(setLimit(pageSize));
    }
    console.log('pagination', pagination);
  };

  // const handleSortChange = (newSortOption) => {
  //   switch (newSortOption) {
  //     case 'default':
  //       dispatch(setSort({ sortBy: 'createdAt', sortOrder: 'desc' }));
  //       break;
  //     case 'popular':
  //       dispatch(setSort({ sortBy: 'popular', sortOrder: 'desc' }));
  //       break;
  //     case 'latest':
  //       dispatch(setSort({ sortBy: 'createdAt', sortOrder: 'desc' }));
  //       break;
  //     case 'price_asc':
  //       dispatch(setSort({ sortBy: 'price', sortOrder: 'asc' }));
  //       break;
  //     case 'price_desc':
  //       dispatch(setSort({ sortBy: 'price', sortOrder: 'desc' }));
  //       break;
  //     case 'name_asc':
  //       dispatch(setSort({ sortBy: 'name', sortOrder: 'asc' }));
  //       break;
  //     case 'name_desc':
  //       dispatch(setSort({ sortBy: 'name', sortOrder: 'desc' }));
  //       break;
  //     case 'rating_desc':
  //       dispatch(setSort({ sortBy: 'rating', sortOrder: 'desc' }));
  //       break;
  //     default:
  //       dispatch(setSort({ sortBy: 'createdAt', sortOrder: 'desc' }));
  //       break;
  //   }
  // };

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
    fetchUsers();
  };

  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      message.error(`Lỗi khi xóa người dùng: ${error.message}`);
    }
  };

  const handleBanUser = async (values) => {
    try {
      await dispatch(
        banUser({
          userId: selectedUserIdForBan,
          banInfo: { reason: values.reason }
        })
      ).unwrap();

      message.success('Đã chặn người dùng thành công');
      setIsOpenBanModal(false);
      fetchUsers();
    } catch (error) {
      message.error(`Lỗi khi chặn người dùng: ${error.message}`);
    }
  };

  // Xử lý bỏ chặn người dùng
  const handleUnbanUser = async (userId) => {
    try {
      await dispatch(unbanUser(userId)).unwrap();
      message.success('Đã bỏ chặn người dùng thành công');
      fetchUsers();
    } catch (error) {
      message.error(`Lỗi khi bỏ chặn người dùng: ${error.message}`);
    }
  };

  // Xử lý chặn người dùng
  const handleOpenModalBanUser = (userId) => {
    setSelectedUserIdForBan(userId);
    setIsOpenBanModal(true);
  };

  const handleCloseBanModal = () => {
    setIsOpenBanModal(false);
    setSelectedUserIdForBan(null);
  };

  const handleOpenEditFormUser = (user) => {
    setSelectedUser(user);
    setIsOpenForm(true);
  };

  const handleOpenAddFormUser = () => {
    setSelectedUser(null);
    setIsOpenForm(true);
  };

  const handleCloseForm = () => {
    setIsOpenForm(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách người dùng: ${error.message}`);
    }
  }, [error]);

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <AdminHeader title='Quản lý người dùng' />

      <main className='mx-auto px-4 py-6 lg:px-8'>
        {/* User Table */}
        <motion.div
          className='flex flex-col gap-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className='site-card-border-less-wrapper'>
            <Card className='card-shadow'>
              <UserFilter onFilterChange={handleFilterChange} onResetFilter={handleResetFilter} />
              {/* <ProductSort onSortChange={handleSortChange} /> */}
            </Card>
          </div>

          <UserTable
            searchText={searchText}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
            onAdd={handleOpenAddFormUser}
            onEdit={handleOpenEditFormUser}
            onDelete={handleDeleteUser}
            onUnban={handleUnbanUser}
            onOpenBanModal={handleOpenModalBanUser}
            onOpenUnbanModal={handleOpenModalBanUser}
          />
        </motion.div>
      </main>

      {/* User Form Modal */}
      {isOpenForm && <UserForm selectedUser={selectedUser} onClose={handleCloseForm} />}

      {/* Ban User Modal */}
      {isOpenBanModal && (
        <BanUserModal isOpenBanModal={isOpenBanModal} onCloseBanModal={handleCloseBanModal} onBan={handleBanUser} />
      )}
    </div>
  );
};

export default UserPage;
