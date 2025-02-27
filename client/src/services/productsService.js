import axios from 'axios';
import axiosClient from './axiosClient';

export const getProducts = async (query) => {
  const { sortType, page, limit } = query;
  const queryLimit = limit === 'all' ? '' : `limit=${limit}`;
  const res = await axiosClient.get(`/product?sortType=${sortType}&page=${page}&${queryLimit}`);
  return res.data;
};
('https://dummyjson.com/products');
export const getAllProducts = () => {
  //   const url = `${API_PATH}/all`;
  const url = 'https://dummyjson.com/products';
  return axios.get(url);
};
