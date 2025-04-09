import axiosClient from './axiosClient';
const BASE_API = '/api/user';

// export const getProducts = async (query) => {
//   const { sortType, page, limit } = query;
//   const queryLimit = limit === 'all' ? '' : `limit=${limit}`;
//   const res = await axiosClient.get(`/product?sortType=${sortType}&page=${page}&${queryLimit}`);
//   return res.data;
// };
// ('https://dummyjson.com/products');

export const getAllUsers = async ({ page = 1, limit = 10, search = '', role = '' }) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    search,
    role
  }).toString();
  let url = BASE_API;
  const res = await axiosClient.get(`${url}?${queryParams}`);
  console.log('check res', res);
  return res;
};

export const updateUserByIdAdmin = async (id, data) => {
  let url = BASE_API;
  const res = await axiosClient.put(`${url}/${id}`, data);
  console.log('check res', res);
  return res;
};
