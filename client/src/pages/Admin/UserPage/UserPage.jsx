import Header from '@/components/AdminComponents/common/Header';
import useDebounce from '@/hooks/useDebounce';
import { banUser, deleteUser, fetchAllUsers, setLimit, setPage, unbanUser } from '@/store/slices/userSlice';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BanUserModal from './BanUserModal';
import UserForm from './UserForm';
import UserTable from './UserTable';

const UserPage = () => {
  const dispatch = useDispatch();

  // Lấy state từ Redux store
  const { users, pagination, loading, error, actionLoading, filters } = useSelector((state) => state.user);

  // State để quản lý UI
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIdForBan, setSelectedUserIdForBan] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBanModalVisible, setIsBanModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });

  // Áp dụng debounce cho search để tránh gọi API quá nhiều
  const debouncedSearchText = useDebounce(searchText, 500);

  // Tạo params cho API từ state
  const fetchUsers = useCallback(() => {
    const queryParams = {
      page: pagination.page || 1,
      limit: pagination.limit || 5,
      search: debouncedSearchText || '',
      role: filters.role,
      isBlocked: filters.isBlocked,
      sortBy: sortOption.sortBy || 'createdAt',
      sortOrder: sortOption.sortOrder || 'desc',
      ...filters
    };

    // Xử lý trường hợp đặc biệt khi cả hai trạng thái isBlocked được chọn
    if (Array.isArray(queryParams.isBlocked) && queryParams.isBlocked.length === 2) {
      // Nếu chọn cả hai trạng thái (true và false), không cần lọc theo isBlocked
      delete queryParams.isBlocked;
    }

    dispatch(fetchAllUsers(queryParams));
  }, [dispatch, pagination.page, pagination.limit, filters, debouncedSearchText, sortOption]);

  // Fetch users khi component mount hoặc các dependencies thay đổi
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(`Lỗi khi tải danh sách người dùng: ${error.message}`);
    }
  }, [error]);

  const handlePageChange = (page, pageSize) => {
    dispatch(setPage(page));
    if (pageSize !== pagination.limit) {
      dispatch(setLimit(pageSize));
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
    // Làm mới danh sách người dùng sau khi đóng modal
    // fetchUsers();
  };
  const handleRefresh = () => {
    setSearchText('');
    setSortOption({ sortBy: 'createdAt', sortOrder: 'desc' });
    setSelectedUser(null);
    setIsModalVisible(false);
    fetchUsers({
      page: 1,
      limit: pagination.limit,
      search: '',
      role: null,
      isBlocked: null,
      sortBy: 'createdAt',
      sortOrder: 'descend'
    });
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

  // Xử lý chặn người dùng
  const handleBanUser = (userId) => {
    setSelectedUserIdForBan(userId);
    setIsBanModalVisible(true);
  };

  const handleCloseBanModal = () => {
    setIsBanModalVisible(false);
    setSelectedUserIdForBan(null);
  };

  const handleConfirmBanUser = async (values) => {
    try {
      await dispatch(
        banUser({
          userId: selectedUserIdForBan,
          banInfo: { reason: values.reason }
        })
      ).unwrap();

      message.success('Đã chặn người dùng thành công');
      setIsBanModalVisible(false);
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

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='Quản lý người dùng' />

      <main className='mx-auto px-4 py-6 lg:px-8'>
        {/* User Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <UserTable
            users={users}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            searchText={searchText}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onAdd={handleAddUser}
            onRefresh={handleRefresh}
            onBan={handleBanUser}
            onUnban={handleUnbanUser}
            filters={filters}
          />
        </motion.div>
      </main>

      {/* User Form Modal */}
      {isModalVisible && <UserForm user={selectedUser} onClose={handleCloseModal} loading={actionLoading} />}

      {/* Ban User Modal */}
      <BanUserModal
        visible={isBanModalVisible}
        onClose={handleCloseBanModal}
        onConfirm={handleConfirmBanUser}
        loading={actionLoading}
      />
    </div>
  );
};

export default UserPage;
