import axios from 'axios';

const API_URL = import.meta.env.VITE_API_END_POINT;

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// // Add an interceptor to attach the token if needed
// axiosClient.interceptors.request.use((config) => {
//   const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

//   // List of paths where the token is not required
//   const noAuthRequired = ['login', 'register'];

//   // Check if the URL contains any of the paths where token is not required
//   const shouldSkipToken = noAuthRequired.some((path) => config.url.includes(path));

//   if (!shouldSkipToken) {
//     config.headers.Authorization = `Bearer ${currentUser.token}`;
//   }

//   return config;
// });

export default axiosClient;
