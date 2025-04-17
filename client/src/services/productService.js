import axiosClient from './axiosClient';
const BASE_API = '/api/product';

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
  return res;
};

export function getProductById(id) {
  let url = BASE_API + '/' + id;
  const res = axiosClient.get(url);
  return res;
}

export const createProduct = async (data) => {
  let url = BASE_API;
  const res = await axiosClient.post(`${url}`, data);
  return res;
};

export const updateProductByIdAdmin = async (id, data) => {
  let url = BASE_API;
  const res = await axiosClient.put(`${url}/${id}`, data);
  return res;
};

export const deleteProductById = async (id) => {
  let url = BASE_API;
  const res = await axiosClient.delete(`${url}/${id}`);
  return res;
};
