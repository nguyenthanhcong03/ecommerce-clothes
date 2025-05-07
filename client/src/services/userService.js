import axios from '@/config/axios';
const BASE_API = '/api/user';

const userService = {
  // Lấy thông tin của người dùng hiện tại
  getCurrentUser: async () => {
    const response = await axios.get(`${BASE_API}/me`);
    return response.data;
  },

  // Lấy danh sách tất cả người dùng (dành cho admin)
  getAllUsers: async (params = {}) => {
    const { page = 1, limit = 10, search = '', role, status, sortBy, sortOrder } = params;
    const queryParams = new URLSearchParams();

    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);

    const response = await axios.get(`${BASE_API}?${queryParams.toString()}`);
    console.log('da vao services userService.js', response);

    return response;
  },

  // Lấy thông tin của một người dùng
  getUserById: async (userId) => {
    const response = await axios.get(`${BASE_API}/${userId}`);
    return response;
  },

  // Tạo người dùng mới bởi Admin
  createUserByAdmin: async (userData) => {
    const response = await axios.post(`${BASE_API}/admin/create`, userData);
    return response;
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userId, userData) => {
    const response = await axios.put(`${BASE_API}/${userId}`, userData);
    return response;
  },

  // Cập nhật thông tin người dùng bởi Admin
  updateUserByAdmin: async (userId, userData) => {
    const response = await axios.put(`${BASE_API}/admin/${userId}`, userData);
    return response;
  },

  // Thay đổi mật khẩu
  changePassword: async (passwordData) => {
    const response = await axios.put(`${BASE_API}/password/change`, passwordData);
    return response;
  },

  // Thay đổi trạng thái người dùng (active/inactive/banned) - chỉ admin
  changeUserStatus: async (userId, status) => {
    const response = await axios.put(`${BASE_API}/${userId}/status`, { status });
    return response;
  },

  // Chặn người dùng (chỉ admin)
  banUser: async (userId, banInfo) => {
    const response = await axios.put(`${BASE_API}/${userId}/ban`, banInfo);
    return response;
  },

  // Bỏ chặn người dùng (chỉ admin)
  unbanUser: async (userId) => {
    const response = await axios.put(`${BASE_API}/${userId}/unban`);
    return response;
  },

  // Xóa người dùng (chỉ admin)
  deleteUser: async (userId) => {
    const response = await axios.delete(`${BASE_API}/${userId}`);
    return response;
  },

  // Thêm địa chỉ mới
  addUserAddress: async (userId, addressData) => {
    const response = await axios.post(`${BASE_API}/${userId}/addresses`, addressData);
    return response;
  },

  // Cập nhật địa chỉ
  updateUserAddress: async (userId, addressId, addressData) => {
    const response = await axios.put(`${BASE_API}/${userId}/addresses/${addressId}`, addressData);
    return response;
  },

  // Xóa địa chỉ
  deleteUserAddress: async (userId, addressId) => {
    const response = await axios.delete(`${BASE_API}/${userId}/addresses/${addressId}`);
    return response;
  },

  // Cập nhật preferences
  updateUserPreferences: async (userId, preferencesData) => {
    const response = await axios.put(`${BASE_API}/${userId}/preferences`, preferencesData);
    return response;
  }
};

export default userService;
