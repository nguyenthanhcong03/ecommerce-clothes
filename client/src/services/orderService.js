import axios from '@/config/axios';
const BASE_API = '/api/orders';
const MAPBOX_TOKEN =
  'pk.eyJ1Ijoibmd1eWVudGhhbmhjb25nMDMiLCJhIjoiY21hODQ5dnUwMTQwajJscHc1bW93eWQ4NSJ9.ItXZ4G8QVf0wFZcqev7_WQ';

export const createOrderAPI = (orderData) => {
  return axios.post(`${BASE_API}`, orderData);
};

/**
 * Lấy tất cả đơn hàng của người dùng hiện tại
 * @param {Object} options - Các tùy chọn phân trang và lọc
 * @param {number} [options.page=1] - Trang hiện tại
 * @param {number} [options.limit=10] - Số lượng đơn hàng mỗi trang
 * @param {string} [options.status] - Trạng thái đơn hàng cần lọc
 * @returns {Promise} - Danh sách đơn hàng và thông tin phân trang
 */
export const getUserOrdersAPI = (options = {}) => {
  const { page = 1, limit = 10, status } = options;
  const params = { page, limit };
  if (status) params.status = status;

  return axios.get(`${BASE_API}/user`, { params });
};

/**
 * Lấy thông tin chi tiết của một đơn hàng
 * @param {string} orderId - ID của đơn hàng cần xem chi tiết
 * @returns {Promise} - Chi tiết đơn hàng
 */
export const getOrderByIdAPI = (orderId) => {
  return axios.get(`${BASE_API}/${orderId}`);
};

/**
 * [ADMIN] Lấy tất cả đơn hàng trong hệ thống
 * @param {Object} options - Các tùy chọn phân trang và lọc
 * @param {number} [options.page=1] - Trang hiện tại
 * @param {number} [options.limit=10] - Số lượng đơn hàng mỗi trang
 * @param {string} [options.status] - Trạng thái đơn hàng cần lọc
 * @returns {Promise} - Danh sách đơn hàng và thông tin phân trang
 */
export const getAllOrdersAPI = (options = {}) => {
  const { page = 1, limit = 10, status } = options;
  const params = { page, limit };
  if (status) params.status = status;

  return axios.get(`${BASE_API}`, { params });
};

/**
 * [ADMIN] Cập nhật trạng thái đơn hàng
 * @param {string} orderId - ID của đơn hàng cần cập nhật
 * @param {string} status - Trạng thái mới ('Processing', 'Shipping', 'Delivered', 'Cancelled')
 * @returns {Promise} - Đơn hàng sau khi cập nhật trạng thái
 */
export const updateOrderStatusAPI = (orderId, status) => {
  return axios.patch(`${BASE_API}/${orderId}/status`, { status });
};

/**
 * [ADMIN] Cập nhật trạng thái thanh toán của đơn hàng
 * @param {string} orderId - ID của đơn hàng cần cập nhật
 * @param {boolean} isPaid - Trạng thái thanh toán (true: đã thanh toán, false: chưa thanh toán)
 * @returns {Promise} - Đơn hàng sau khi cập nhật trạng thái thanh toán
 */
export const updatePaymentStatusAPI = (orderId, isPaid) => {
  return axios.patch(`${BASE_API}/${orderId}/payment`, { isPaid });
};

/**
 * [ADMIN] Lấy thống kê về đơn hàng cho bảng điều khiển admin
 * @returns {Promise} - Dữ liệu thống kê đơn hàng
 */
export const getOrderStatisticsAPI = () => {
  return axios.get(`${BASE_API}/statistics/dashboard`);
};

/**
 * Hàm tìm kiếm đơn hàng theo từ khóa (số điện thoại, email, hoặc mã đơn hàng)
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Promise} - Kết quả tìm kiếm đơn hàng
 */
export const searchOrdersAPI = (keyword) => {
  return axios.get(`${BASE_API}/search`, { params: { keyword } });
};

/**
 * Hủy đơn hàng (chỉ áp dụng cho đơn hàng chưa giao)
 * @param {string} orderId - ID của đơn hàng cần hủy
 * @param {string} reason - Lý do hủy đơn hàng
 * @returns {Promise} - Đơn hàng sau khi hủy
 */
export const cancelOrderAPI = (orderId, reason) => {
  return axios.post(`${BASE_API}/${orderId}/cancel`, { reason });
};

/**
 * Lưu địa chỉ giao hàng cho lần sau
 * @param {Object} addressData - Thông tin địa chỉ giao hàng
 * @returns {Promise} - Thông tin địa chỉ đã lưu
 */
export const saveShippingAddressAPI = (addressData) => {
  return axios.post('/api/user/shipping-address', addressData);
};

/**
 * Lấy danh sách địa chỉ giao hàng đã lưu
 * @returns {Promise} - Danh sách địa chỉ giao hàng
 */
export const getShippingAddressesAPI = () => {
  return axios.get('/api/user/shipping-address');
};

/**
 * Đánh giá đơn hàng sau khi nhận được
 * @param {string} orderId - ID của đơn hàng
 * @param {Object} reviewData - Dữ liệu đánh giá
 * @param {number} reviewData.rating - Số sao đánh giá (1-5)
 * @param {string} reviewData.comment - Nội dung đánh giá
 * @returns {Promise} - Kết quả đánh giá
 */
export const reviewOrderAPI = (orderId, reviewData) => {
  return axios.post(`${BASE_API}/${orderId}/review`, reviewData);
};

export default {
  createOrderAPI,
  getUserOrdersAPI,
  getOrderByIdAPI,
  getAllOrdersAPI,
  updateOrderStatusAPI,
  updatePaymentStatusAPI,
  getOrderStatisticsAPI,
  searchOrdersAPI,
  cancelOrderAPI,
  saveShippingAddressAPI,
  getShippingAddressesAPI,
  reviewOrderAPI
};
