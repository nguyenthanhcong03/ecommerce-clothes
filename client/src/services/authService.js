import axios from '@/config/axios';

const BASE_API = '/api/auth';

export const register = async (data) => {
  const response = await axios.post(`${BASE_API}/register`, data);
  return response;
};

export const login = async (username, password, rememberMe) => {
  const response = await axios.post(`${BASE_API}/login`, { username, password, rememberMe });

  if (response?.accessToken) {
    // Store token in localStorage for non-HttpOnly cookie fallback
    localStorage.setItem('accessToken', response.accessToken);
  }

  return response;
};

export const callLogout = async () => {
  const response = await axios.post(`${BASE_API}/logout`);

  // Clear stored tokens
  localStorage.removeItem('accessToken');

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
      withCredentials: true // Send HttpOnly cookies
    }
  );

  if (response?.accessToken) {
    localStorage.setItem('accessToken', response.accessToken);
  }

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
