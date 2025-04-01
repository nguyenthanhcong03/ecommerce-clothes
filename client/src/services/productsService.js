import axios from 'axios';
import axiosClient from './axiosClient';
const BASE_API = '/api/product';

export const getProducts = async (query) => {
  const { sortType, page, limit } = query;
  const queryLimit = limit === 'all' ? '' : `limit=${limit}`;
  const res = await axiosClient.get(`/product?sortType=${sortType}&page=${page}&${queryLimit}`);
  return res.data;
};
('https://dummyjson.com/products');

export function getAllProducts() {
  let url = BASE_API;
  const res = axiosClient.get(url);
  return res;
}

export function getProductById(id) {
  let url = BASE_API + '/' + id;
  const res = axiosClient.get(url);
  return res;
}
