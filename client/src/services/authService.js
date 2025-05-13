import axios from '@/config/axios';
import Cookies from 'js-cookie';

const BASE_API = '/api/auth';

export const register = async (data) => {
  const response = await axios.post(`${BASE_API}/register`, data);
  return response;
};

export const login = async (username, password, rememberMe) => {
  const response = await axios.post(`${BASE_API}/login`, { username, password, rememberMe });

  // CASE 1: For httpOnly cookies
  // No need to manually store tokens, server sets httpOnly cookies

  // CASE 2: For non-httpOnly cookies (when server doesn't set httpOnly)
  if (response?.accessToken) {
    Cookies.set('accessToken', response.accessToken);
    if (response?.refreshToken) {
      Cookies.set('refreshToken', response.refreshToken);
    }
  }

  // CASE 3: For localStorage fallback
  /*
  if (response?.accessToken) {
    localStorage.setItem('accessToken', response.accessToken);
    if (response?.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
  }
  */

  return response;
};

export const callLogout = async () => {
  const response = await axios.post(`${BASE_API}/logout`);

  // CASE 1: For httpOnly cookies
  // No need to manually clear tokens, server will clear httpOnly cookies

  // CASE 2: For non-httpOnly cookies
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  // CASE 3: For localStorage fallback
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  return response;
};

export const callFetchAccount = async () => {
  const response = await axios.get(`${BASE_API}/current`);
  return response;
};

export const refreshAccessToken = async () => {
  const response = await axios.post(
    `${BASE_API}/refresh-token`,
    {},
    {
      withCredentials: true // Essential for sending/receiving httpOnly cookies
    }
  );

  // CASE 1: For httpOnly cookies
  // No need to manually set tokens, server sets httpOnly cookies in response

  // CASE 2: For non-httpOnly cookies
  if (response?.accessToken) {
    Cookies.set('accessToken', response.accessToken);
    if (response?.refreshToken) {
      Cookies.set('refreshToken', response.refreshToken);
    }
  }

  // CASE 3: For localStorage fallback
  /*
  if (response?.accessToken) {
    localStorage.setItem('accessToken', response.accessToken);
    if (response?.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
  }
  */

  return response;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${BASE_API}/forgot-password`, { email });
  return response;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${BASE_API}/reset-password`, {
    token,
    newPassword
  });
  return response;
};

export const changePassword = async (oldPassword, newPassword) => {
  const response = await axios.post(`${BASE_API}/change-password`, {
    oldPassword,
    newPassword
  });
  return response;
};

export const verifyEmail = async (token) => {
  const response = await axios.get(`${BASE_API}/verify-email`, {
    params: { token }
  });
  return response;
};
