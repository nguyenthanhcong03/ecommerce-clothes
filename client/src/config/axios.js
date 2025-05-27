import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

let hasShownSessionExpiredMessage = false;
let isRefreshing = false;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

const axiosInstanceWithCredentials = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  withCredentials: true
});

// Request interceptor - KHÔNG CẦN THÊM TOKEN VÀO HEADER
axiosInstance.interceptors.request.use(
  (config) => {
    // Cookie sẽ tự động được gửi với withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor cho httpOnly cookies
axiosInstance.interceptors.response.use(
  (response) => {
    // Reset flag khi có response thành công
    hasShownSessionExpiredMessage = false;
    return response?.data || response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý 401 với httpOnly cookies
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;

      // Kiểm tra xem có phải lỗi do access token hết hạn không
      const errorMessage = error.response?.data?.message || '';
      console.log('error.response', error.response);
      console.log('errorMessage', errorMessage);
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        isRefreshing = true;

        try {
          console.log('first');
          // Thử refresh token (cookie sẽ tự động được gửi)
          await axiosInstanceWithCredentials.post(`${API_URL}/api/auth/refresh-token`);
          console.log('firs2t');
          // Refresh thành công, retry request gốc
          isRefreshing = false;
          hasShownSessionExpiredMessage = false;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh thất bại - session thực sự hết hạn
          isRefreshing = false;
          handleSessionExpired();
          return Promise.reject(refreshError);
        }
      } else {
        // 401 nhưng không phải do token hết hạn (user chưa đăng nhập)
        redirectToLoginIfNeeded();
      }
    }

    return Promise.reject(error);
  }
);

// Xử lý session hết hạn
const handleSessionExpired = () => {
  if (!hasShownSessionExpiredMessage) {
    hasShownSessionExpiredMessage = true;

    toast.error('Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.', {
      position: 'top-right',
      autoClose: 3000,
      toastId: 'session-expired',
      onClose: () => {
        // Có thể gọi logout API để xóa cookie ở server
        logoutAndRedirect();
      }
    });
  }
};

const logoutAndRedirect = async () => {
  try {
    // Gọi logout API để xóa httpOnly cookies
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    window.location.href = '/login';
  }
};

const redirectToLoginIfNeeded = () => {
  const currentPath = window.location.pathname;
  const publicPaths = ['/login', '/register', '/forgot-password', '/'];

  if (!publicPaths.includes(currentPath)) {
    // window.location.href = '/login';
  }
};

export default axiosInstance;
