import axios from '@/config/axios';
const BASE_API = '/api/product';

// Lấy danh sách sản phẩm với các tùy chọn lọc, sắp xếp, phân trang
export const getAllProductsAPI = (params) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    featured,
    isActive = 'true',
    tags,
    size,
    color,
    rating,
    inStock,
    sortBy,
    sortOrder
  } = params;

  const queryParams = { page, limit };

  // Thêm các tham số tìm kiếm và lọc nếu có
  if (search) queryParams.search = search;
  if (sortBy) queryParams.sortBy = sortBy;
  if (sortOrder) queryParams.sortOrder = sortOrder;
  if (category) queryParams.category = category;
  if (tags) queryParams.tags = tags;
  if (size) queryParams.size = size;
  if (color) queryParams.color = color;
  if (rating) queryParams.rating = rating;
  if (featured) queryParams.featured = featured;
  if (isActive) queryParams.isActive = isActive;
  if (inStock) queryParams.inStock = inStock;
  if (minPrice) queryParams.minPrice = minPrice;
  if (maxPrice) queryParams.maxPrice = maxPrice;
  console.log('queryParams', queryParams);

  // Sửa lỗi cú pháp khi gọi axios
  return axios.get(`${BASE_API}`, { params: queryParams });
};

// Lấy sản phẩm theo ID
export const getProductByIdAPI = (id) => {
  return axios.get(`${BASE_API}/${id}`).then((response) => {
    return response.data;
  });
};

// Tạo sản phẩm mới
export const createProductAPI = (product) => {
  return axios.post(`${BASE_API}`, product).then((response) => {
    return response.data;
  });
};

// Cập nhật sản phẩm
export const updateProductByIdAPI = (id, product) => {
  return axios.put(`${BASE_API}/${id}`, product).then((response) => {
    return response;
  });
};

// Xóa sản phẩm
export const deleteProductByIdAPI = (id) => {
  return axios.delete(`${BASE_API}/${id}`).then((response) => {
    return response.data;
  });
};

// Lấy sản phẩm nổi bật
export const getFeaturedProductsAPI = (limit = 8) => {
  return axios.get('/product/featured', { params: { limit } }).then((response) => {
    return response.data;
  });
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategoryAPI = (categoryId, page = 1, limit = 10) => {
  return axios
    .get(`/product/category/${categoryId}`, {
      params: { page, limit }
    })
    .then((response) => {
      return response.data;
    });
};

// Thêm đánh giá sản phẩm
export const addProductReviewAPI = (productId, reviewData) => {
  return axios.post(`/product/${productId}/reviews`, reviewData).then((response) => {
    return response.data;
  });
};

// Lấy đánh giá của sản phẩm
export const getProductReviewsAPI = (productId, page = 1, limit = 10) => {
  return axios
    .get(`/product/${productId}/reviews`, {
      params: { page, limit }
    })
    .then((response) => {
      return response.data;
    });
};

// Cập nhật trạng thái sản phẩm (active/inactive)
export const updateProductStatusAPI = (productId, isActive) => {
  return axios.patch(`/product/${productId}/status`, { isActive }).then((response) => {
    return response.data;
  });
};
