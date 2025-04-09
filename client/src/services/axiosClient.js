import axios from 'axios';

const API_URL = import.meta.env.VITE_API_END_POINT;

// const axiosClient = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });
// const token = localStorage.getItem('accessToken');
// if (token) {
//   axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// }
// // axiosClient.defaults.headers.common = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };

// const handleRefreshToken = async () => {
//   const res = await axiosClient.get('/auth/refresh-token');
//   if (res && res.data) return res.data.accessToken;
//   else null;
// };

// // Add a request interceptor
// axiosClient.interceptors.request.use(
//   function (config) {
//     // Do something before request is sent
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

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
  // withCredentials: true
});

axiosClient.defaults.headers.common = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };

const handleRefreshToken = async () => {
  const res = await axiosClient.get('/auth/refresh-token');
  if (res && res.data) return res.data.accessToken;
  else null;
};

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

const NO_RETRY_HEADER = 'x-no-retry';

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response && response.data ? response.data : response;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.config && error.response && +error.response.status === 401 && !error.config.headers[NO_RETRY_HEADER]) {
      const accessToken = await handleRefreshToken();
      error.config.headers[NO_RETRY_HEADER] = 'true';
      if (accessToken) {
        error.config.headers['Authorization'] = `Bearer ${accessToken}`;
        localStorage.setItem('accessToken', accessToken);
        return axiosClient.request(error.config);
      }
    }

    if (
      error.config &&
      error.response &&
      +error.response.status === 400 &&
      error.config.url === '/auth/refresh-token'
    ) {
      window.location.href = '/login';
    }

    return error?.response?.data ?? Promise.reject(error);
  }
);

export default axiosClient;
