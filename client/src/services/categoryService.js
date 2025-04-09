import axiosClient from './axiosClient';
const BASE_API = '/api/category';

// export const getProducts = async (query) => {
//   const { sortType, page, limit } = query;
//   const queryLimit = limit === 'all' ? '' : `limit=${limit}`;
//   const res = await axiosClient.get(`/product?sortType=${sortType}&page=${page}&${queryLimit}`);
//   return res.data;
// };
// ('https://dummyjson.com/products');

export const getAllCategories = async () => {
  let url = BASE_API;
  const res = await axiosClient.get(`${url}`);
  console.log('check res', res);
  return res;
};

export const createCategory = async (data) => {
  let url = BASE_API;
  const res = await axiosClient.post(`${url}`, data);
  console.log('check res create', res);
  return res;
};

export const updateCategoryByIdAdmin = async (id, data) => {
  let url = BASE_API;
  const res = await axiosClient.put(`${url}/${id}`, data);
  console.log('check res', res);
  return res;
};
