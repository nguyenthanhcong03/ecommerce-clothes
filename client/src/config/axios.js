import axios from 'axios';
import Cookies from 'js-cookie';
import { refreshAccessToken } from '../services/authService';
const API_URL = import.meta.env.VITE_API_END_POINT;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
  // timeout: 10000 // 10 giây
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => (response && response.data ? response.data : response),
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là do hết hạn accessToken
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/refresh-token')) {
        console.log('1S');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        // window.location.href = '/login';
        // return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log('first');
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // const refreshToken = Cookies.get('refreshToken');
        // // Nếu không có refreshToken trong cookies thì nên logout luôn, tránh gọi API không cần thiết
        // if (!refreshToken) {
        //   Cookies.remove('accessToken');
        //   Cookies.remove('refreshToken');
        //   // window.location.href = '/login';
        //   // return Promise.reject(error);
        // }

        const response = await refreshAccessToken();
        console.log('response', response);

        const { accessToken } = response;
        // const { accessToken, refreshToken: newRefreshToken } = response.data;
        // Cookies.set('accessToken', accessToken);
        // Cookies.set('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Nếu lỗi khác 401 hoặc không có response (lỗi mạng)
    return Promise.reject(error);
  }
);

export default api;
