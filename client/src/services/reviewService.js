import axios from '@/config/axios';
const BASE_API = '/api/reviews';

export const getProductReviewsAPI = async (productId, params) => {
  const response = await axios.get(`${BASE_API}/product/${productId}`, {
    params: params
  });
  return response;
};

// Lấy danh sách đánh giá của người dùng hiện tại
export const getUserReviewsAPI = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  const response = await axios.get(`${BASE_API}/user`, {
    params: { page, limit }
  });
  return response;
};

// Tạo đánh giá mới cho sản phẩm
export const createReviewAPI = async (reviewData) => {
  const response = await axios.post(`${BASE_API}`, reviewData);
  return response;
};

// Lấy danh sách sản phẩm có thể đánh giá từ một đơn hàng đã giao
export const getReviewableProductsAPI = async (orderId) => {
  const response = await axios.get(`${BASE_API}/order/${orderId}/reviewable`);
  return response;
};

// Admin: Thêm phản hồi vào đánh giá
export const addReplyToReviewAPI = async (reviewId, reply) => {
  const response = await axios.put(`${BASE_API}/admin/${reviewId}/reply`, { reply });
  return response;
};
