import axiosClient from './axiosClient';
const BASE_API = '/api/product';

export const getProducts = async (query) => {
  const { sortType, page, limit } = query;
  const queryLimit = limit === 'all' ? '' : `limit=${limit}`;
  const res = await axiosClient.get(`/product?sortType=${sortType}&page=${page}&${queryLimit}`);
  return res.data;
};
('https://dummyjson.com/products');

export const getAllProducts = async ({
  page = 1,
  limit = 10,
  search = '',
  brand = '',
  color = '',
  size = '',
  minPrice = '',
  maxPrice = ''
}) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    search,
    brand,
    color,
    size,
    minPrice,
    maxPrice
  }).toString();
  let url = BASE_API;
  const res = await axiosClient.get(`${url}?${queryParams}`);
  console.log('check res', res);
  return res;
};

export function getProductById(id) {
  let url = BASE_API + '/' + id;
  const res = axiosClient.get(url);
  return res;
}
