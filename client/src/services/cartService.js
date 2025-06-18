import axios from '@/config/axios';
const BASE_API = '/api/cart';

export const addToCartAPI = async (data) => {
  let url = BASE_API;
  const res = await axios.post(`${url}`, data);
  return res;
};

export const getCartAPI = async () => {
  let url = BASE_API;
  const res = await axios.get(`${url}`);
  return res;
};

export const updateCartItemAPI = async (itemId, quantity) => {
  let url = BASE_API;
  const res = await axios.patch(`${url}/${itemId}`, { quantity });
  return res;
};

export const removeCartItemAPI = async (itemId) => {
  const res = await axios.delete(`${BASE_API}/${itemId}`);
  return res;
};

export const removeMultipleCartItemsAPI = async (itemIds) => {
  const res = await axios.delete(`${BASE_API}/multiple`, {
    data: { itemIds }
  });
  return res;
};

export const clearCartAPI = async () => {
  let url = BASE_API;
  const res = await axios.delete(`${url}/clear`);
  return res;
};
