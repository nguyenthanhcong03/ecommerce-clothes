// import axios from 'axios';

const API_URL = import.meta.env.VITE_API_END_POINT;

// const axiosClient = axios.create({
//   baseURL: API_URL,
//   // headers: {
//   //   'Content-Type': 'application/json'
//   // }
//   withCredentials: true
// });

// // axiosClient.defaults.headers.common = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };
// // // Alter defaults after instance has been created
// // axiosClient.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// // const token = localStorage.getItem('accessToken');
// // if (token) {
// //   axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// // }

// const handleRefreshToken = async () => {
//   const res = await axiosClient.post(`${API_URL}/api/auth/refresh-token`);
//   if (res && res.data) return res.data.accessToken;
//   else null;
// };

// // Add a request interceptor
// axiosClient.interceptors.request.use(
//   function (config) {
//     // Do something before request is sent
//     // const token = localStorage.getItem('accessToken');
//     // if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   function (error) {
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

// const NO_RETRY_HEADER = 'x-no-retry';

// // Add a response interceptor
// axiosClient.interceptors.response.use(
//   function (response) {
//     // Any status code that lie within the range of 2xx cause this function to trigger
//     // Do something with response data
//     return response && response.data ? response.data : response;
//   },
//   async function (error) {
//     // Any status codes that falls outside the range of 2xx cause this function to trigger
//     // Do something with response error
//     if (error.config && error.response && +error.response.status === 401 && !error.config.headers[NO_RETRY_HEADER]) {
//       const accessToken = await handleRefreshToken();
//       error.config.headers[NO_RETRY_HEADER] = 'true';
//       if (accessToken) {
//         error.config.headers['Authorization'] = `Bearer ${accessToken}`;
//         localStorage.setItem('accessToken', accessToken);
//         return axiosClient.request(error.config);
//       }
//     }

//     if (
//       error.config &&
//       error.response &&
//       +error.response.status === 400 &&
//       error.config.url === '/auth/refresh-token'
//     ) {
//       window.location.href = '/login';
//     }

//     return error?.response?.data ?? Promise.reject(error);
//   }
// );

// export default axiosClient;

// utils/axiosInstance.js
import axios from 'axios';
import Cookies from 'js-cookie';
import { refreshAccessToken } from './authService';

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
