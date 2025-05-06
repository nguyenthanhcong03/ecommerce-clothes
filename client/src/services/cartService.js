import axios from '@/config/axios';
const BASE_API = '/api/cart';

export const addToCartService = async (data) => {
  console.log('data service', data);
  let url = BASE_API;
  const res = await axios.post(`${url}`, data);
  return res;
};

export const getCartService = async () => {
  let url = BASE_API;
  const res = await axios.get(`${url}`);
  return res;
};

export const updateCartItemService = async (data) => {
  let url = BASE_API;
  const res = await axios.patch(`${url}/update`, data);
  return res;
};

export const removeCartItemService = async (itemId) => {
  let url = BASE_API;
  const res = await axios.delete(`${url}/${itemId}`);
  return res;
};

export const clearCartService = async () => {
  let url = BASE_API;
  const res = await axios.delete(`${url}/clear`);
  return res;
};
