import axios from '@/config/axios';
const BASE_API = '/api/user';

// Lấy thông tin của người dùng hiện tại
export const getCurrentUserAPI = async () => {
  const response = await axios.get(`${BASE_API}/me`);
  return response.data;
};

// Lấy danh sách tất cả người dùng (dành cho admin)
export const getAllUsersAPI = async (params = {}) => {
  console.log('params userService', params);
  const response = await axios.get(`${BASE_API}`, { params });
  return response;
};

// Lấy thông tin của một người dùng
export const getUserByIdAPI = async (userId) => {
  const response = await axios.get(`${BASE_API}/${userId}`);
  return response;
};

// Tạo người dùng mới bởi Admin
export const createUserByAdminAPI = async (userData) => {
  const response = await axios.post(`${BASE_API}/admin/create`, userData);
  return response;
};

// Cập nhật thông tin người dùng
export const updateUserAPI = async (userId, userData) => {
  const response = await axios.put(`${BASE_API}/${userId}`, userData);
  return response;
};

// Cập nhật thông tin người dùng bởi Admin
export const updateUserByAdminAPI = async (userId, userData) => {
  const response = await axios.put(`${BASE_API}/admin/${userId}`, userData);
  return response;
};

// Thay đổi mật khẩu
export const changePasswordAPI = async (passwordData) => {
  const response = await axios.put(`${BASE_API}/password/change`, passwordData);
  return response;
};

// Thay đổi trạng thái người dùng (active/inactive/banned) - chỉ admin
export const changeUserStatusAPI = async (userId, status) => {
  const response = await axios.put(`${BASE_API}/${userId}/status`, { status });
  return response;
};

// Chặn người dùng (chỉ admin)
export const banUserAPI = async (userId, banInfo) => {
  const response = await axios.put(`${BASE_API}/${userId}/ban`, banInfo);
  return response;
};

// Bỏ chặn người dùng (chỉ admin)
export const unbanUserAPI = async (userId) => {
  const response = await axios.put(`${BASE_API}/${userId}/unban`);
  return response;
};

// Xóa người dùng (chỉ admin)
export const deleteUserAPI = async (userId) => {
  const response = await axios.delete(`${BASE_API}/${userId}`);
  return response;
};
