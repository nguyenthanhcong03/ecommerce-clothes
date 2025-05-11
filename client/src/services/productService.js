import axios from '@/config/axios';
const BASE_API = '/api/product';

// Lấy danh sách sản phẩm với các tùy chọn lọc, sắp xếp, phân trang
export const getAllProductsAPI = (params) => {
  // Xử lý các tham số định dạng đặc biệt
  const queryParams = { ...params };

  // Xử lý các mảng (chuyển thành chuỗi phân tách bởi dấu phẩy)
  ['brand', 'size', 'color', 'tags'].forEach((param) => {
    if (queryParams[param] && Array.isArray(queryParams[param]) && queryParams[param].length > 0) {
      queryParams[param] = queryParams[param].join(',');
    }
  });

  // Xử lý các giá trị boolean, chuyển thành chuỗi 'true' hoặc 'false'
  ['inStock', 'featured', 'isActive'].forEach((param) => {
    if (queryParams[param] !== undefined) {
      queryParams[param] = queryParams[param].toString();
    }
  });

  // Xử lý giá trị số
  ['rating', 'minPrice', 'maxPrice'].forEach((param) => {
    if (queryParams[param] !== undefined && queryParams[param] !== null && queryParams[param] !== '') {
      queryParams[param] = queryParams[param].toString();
    }
  });

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
  return axios.post('${BASE_API}', product).then((response) => {
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
