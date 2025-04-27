import axiosClient from './axiosClient';
const BASE_API = '/api/product';

export const getAllProducts = ({
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
  return axiosClient.get(`${BASE_API}?${queryParams}`);
};

export const getProductById = (id) => {
  return axiosClient.get(`${BASE_API}/${id}`);
};

export const createProduct = (data) => {
  return axiosClient.post(BASE_API, data);
};

export const updateProductByIdAdmin = (id, data) => {
  return axiosClient.put(`${BASE_API}/${id}`, data);
};

export const deleteProductById = (id) => {
  return axiosClient.delete(`${BASE_API}/${id}`);
};

export const getFeaturedProducts = (limit = 8) => {
  const queryParams = new URLSearchParams({ limit }).toString();
  return axiosClient.get(`${BASE_API}/featured/list?${queryParams}`);
};

export const getProductsByCategory = (categoryId, page = 1, limit = 10) => {
  const queryParams = new URLSearchParams({ page, limit }).toString();
  return axiosClient.get(`${BASE_API}/category/${categoryId}?${queryParams}`);
};

export const searchProducts = (query, page = 1, limit = 10) => {
  const queryParams = new URLSearchParams({ q: query, page, limit }).toString();
  return axiosClient.get(`${BASE_API}/search/query?${queryParams}`);
};

export const addProductReview = (productId, reviewData) => {
  return axiosClient.post(`${BASE_API}/${productId}/reviews`, reviewData);
};

export const getProductReviews = (productId, page = 1, limit = 10) => {
  const queryParams = new URLSearchParams({ page, limit }).toString();
  return axiosClient.get(`${BASE_API}/${productId}/reviews?${queryParams}`);
};

export const updateProductStatus = (productId, isActive) => {
  return axiosClient.patch(`${BASE_API}/${productId}/status`, { isActive });
};
