import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, deleteUser, setFilters, banUser, unbanUser } from '@/store/slices/userSlice';
import { message, Button } from 'antd';
import { motion } from 'framer-motion';
import { Users, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import Header from '@/components/AdminComponents/common/Header';
import StatCard from '@/components/AdminComponents/common/StatCard';
import UserTable from './UserTable';
import UserForm from './UserForm';
import BanUserModal from './BanUserModal';
import useDebounce from '@/hooks/useDebounce';

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
  const [sortInfo, setSortInfo] = useState({
    field: 'createdAt',
    order: 'descend'
  });

  // Áp dụng debounce cho search để tránh gọi API quá nhiều
  const debouncedSearchText = useDebounce(searchText, 500);

  // Tạo params cho API từ state
  const fetchUsers = useCallback(
    (params = {}) => {
      const queryParams = {
        page: params.page || pagination.page || 1,
        limit: params.limit || pagination.limit || 10,
        search: params.search !== undefined ? params.search : debouncedSearchText,
        role: params.role || filters.role,
        status: params.status || filters.status,
        sortBy: params.sortBy || sortInfo.field,
        sortOrder: params.sortOrder === 'ascend' ? 'asc' : 'desc'
      };

      dispatch(fetchAllUsers(queryParams));
    },
    [dispatch, pagination.page, pagination.limit, debouncedSearchText, filters.role, filters.status, sortInfo.field]
  );

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

  // Handlers for table actions
  const handleTableChange = (pagination, filters, sorter) => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      role: filters.role && filters.role.length > 0 ? filters.role[0] : null,
      status: filters.status && filters.status.length > 0 ? filters.status[0] : null,
      sortBy: sorter.field || 'createdAt',
      sortOrder: sorter.order || 'descend'
    };

    // Lưu giá trị filters vào Redux
    dispatch(
      setFilters({
        role: params.role,
        status: params.status
      })
    );

    // Lưu thông tin sort
    setSortInfo({
      field: params.sortBy,
      order: params.sortOrder
    });

    fetchUsers(params);
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
    console.log('userId', userId);
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

  // Tính toán thống kê người dùng
  const userStats = {
    totalUsers: pagination.total || 0,
    activeUsers: users.filter((user) => user.status === 'active').length,
    adminUsers: users.filter((user) => user.role === 'admin').length,
    bannedUsers: users.filter((user) => user.status === 'banned').length
  };

  return (
    <div className='relative z-10 flex-1 overflow-auto'>
      <Header title='User Management' />

      <main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
        {/* Statistics Cards */}
        <motion.div
          className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard name='Tổng người dùng' icon={Users} value={userStats.totalUsers} color='#6366F1' />
          <StatCard name='Người dùng hoạt động' icon={CheckCircle} value={userStats.activeUsers} color='#10B981' />
          <StatCard name='Admin' icon={UserPlus} value={userStats.adminUsers} color='#F59E0B' />
          <StatCard name='Bị chặn' icon={AlertTriangle} value={userStats.bannedUsers} color='#EF4444' />
        </motion.div>

        {/* Actions Button */}
        <div className='mb-4 flex justify-between'>
          <div></div>
          <Button type='primary' icon={<UserPlus size={16} />} onClick={handleAddUser}>
            Thêm người dùng mới
          </Button>
        </div>

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
            onChange={handleTableChange}
            onSearch={handleSearch}
            searchText={searchText}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
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
