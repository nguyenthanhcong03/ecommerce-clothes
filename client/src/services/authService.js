import axios from 'axios';
import axiosClient from './axiosClient.js';

const BASE_API = '/api/auth';

export const register = async (data) => {
  return await axiosClient.post(BASE_API + '/register', data);
};

export const login = async (username, password) => {
  return await axiosClient.post(BASE_API + '/login', { username, password });
};

export const callLogout = () => {
  return axiosClient.post(BASE_API + '/logout');
};

export const callFetchAccount = () => {
  return axiosClient.get(BASE_API + '/current');
};

export const refreshToken = async () => {
  try {
    const response = await axiosClient.post(
      BASE_API + '/refresh-token',
      {},
      {
        withCredentials: true // Gửi cookie HttpOnly nếu có
      }
    );

    const newAccessToken = response.data.accessToken;

    // Cập nhật vào localStorage hoặc context API nếu cần
    localStorage.setItem('accessToken', newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('Refresh token failed', error);
    throw error; // Ném lỗi để xử lý logout nếu cần
    //logout
  }
};
