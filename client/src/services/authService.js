import axios from '@/config/axios';
// import Cookies from 'js-cookie';

const BASE_API = '/api/auth';

export const registerAPI = async (data) => {
  const response = await axios.post(`${BASE_API}/register`, data);
  return response;
};

export const loginAPI = async (username, password, rememberMe) => {
  const response = await axios.post(`${BASE_API}/login`, { username, password, rememberMe });

  return response;
};

export const logoutAPI = async () => {
  const response = await axios.post(`${BASE_API}/logout`);

  return response;
};

export const fetchCurrentUserAPI = async () => {
  const response = await axios.get(`${BASE_API}/current`);
  return response;
};

export const refreshAccessTokenAPI = async () => {
  const response = await axios.post(
    `${BASE_API}/refresh-token`,
    {},
    {
      withCredentials: true // Essential for sending/receiving httpOnly cookies
    }
  );

  return response;
};

export const forgotPasswordAPI = async (email) => {
  const response = await axios.post(`${BASE_API}/forgot-password`, { email });
  return response;
};

export const resetPasswordAPI = async (token, newPassword) => {
  const response = await axios.post(`${BASE_API}/reset-password`, {
    token,
    newPassword
  });
  return response;
};

export const changePasswordAPI = async (oldPassword, newPassword) => {
  const response = await axios.post(`${BASE_API}/change-password`, {
    oldPassword,
    newPassword
  });
  return response;
};

/**
 * Kiểm tra username đã tồn tại hay chưa
 */
export const checkUsernameExistsAPI = async (username) => {
  try {
    const response = await axios.get(`${BASE_API}/check-username/${encodeURIComponent(username)}`);
    return response;
  } catch {
    // Nếu có lỗi, trả về object mặc định
    return {
      success: false,
      exists: false,
      message: 'Không thể kiểm tra username'
    };
  }
};

/**
 * Kiểm tra email đã tồn tại hay chưa
 */
export const checkEmailExistsAPI = async (email) => {
  try {
    const response = await axios.get(`${BASE_API}/check-email/${encodeURIComponent(email)}`);
    return response;
  } catch {
    // Nếu có lỗi, trả về object mặc định
    return {
      success: false,
      exists: false,
      message: 'Không thể kiểm tra email'
    };
  }
};
