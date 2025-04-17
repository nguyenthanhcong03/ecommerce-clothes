import axiosClient from './axiosClient';
const BASE_API = '/api/category';

// export const getProducts = async (query) => {
//   const { sortType, page, limit } = query;
//   const queryLimit = limit === 'all' ? '' : `limit=${limit}`;
//   const res = await axiosClient.get(`/product?sortType=${sortType}&page=${page}&${queryLimit}`);
//   return res.data;
// };
// ('https://dummyjson.com/products');

export const getAllCategories = async ({ page = 1, limit = 10, search = '' }) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    search
  }).toString();
  let url = BASE_API;
  const res = await axiosClient.get(`${url}?${queryParams}`);
  console.log('check res getall', res);
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
