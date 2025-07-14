import axios from '@/config/axios';
const BASE_API = '/api/orders';

export const createOrderAPI = (orderData) => {
  return axios.post(`${BASE_API}`, orderData);
};

export const getUserOrdersAPI = (options = {}) => {
  const { page = 1, limit = 10, status } = options;
  const params = { page, limit };
  if (status) params.status = status;

  return axios.get(`${BASE_API}/user`, { params });
};

export const getOrderByIdAPI = (orderId) => {
  return axios.get(`${BASE_API}/${orderId}`);
};

export const getAllOrdersAPI = (params) => {
  console.log('params', params);
  return axios.get(`${BASE_API}`, { params });
};

export const updateOrderStatusAPI = (orderId, status) => {
  return axios.patch(`${BASE_API}/${orderId}/status`, { status });
};

export const updatePaymentStatusAPI = (orderId, status) => {
  return axios.patch(`${BASE_API}/${orderId}/payment`, { status });
};

export const searchOrdersAPI = (keyword) => {
  return axios.get(`${BASE_API}/search`, { params: { keyword } });
};

export const cancelOrderAPI = (orderId, reason) => {
  return axios.post(`${BASE_API}/${orderId}/cancel`, { reason });
};
