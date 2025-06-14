import api from '@/config/axios';

const BASE_API = '/api/statistics';

/**
 * Lấy thống kê tổng quan
 * @returns {Promise} - Thống kê tổng quan
 */
export const getOverviewStatistics = async () => {
  const response = await api.get(`${BASE_API}/overview`);
  console.log('overview', response);
  return response;
};

/**
 * Lấy thống kê doanh thu
 * @param {string} period - Khoảng thời gian: 'today', 'week', 'month', 'year', 'custom'
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @returns {Promise} - Thống kê doanh thu
 */
export const getRevenueStatistics = async (period = 'month', startDate = null, endDate = null) => {
  let params = { period };
  if (period === 'custom' && startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const response = await api.get(`${BASE_API}/revenue`, { params });
  console.log('revenue', response);
  return response;
};

/**
 * Lấy thống kê sản phẩm bán chạy
 * @param {number} limit - Số lượng sản phẩm muốn lấy
 * @param {string} period - Khoảng thời gian: 'today', 'week', 'month', 'year', 'custom'
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @returns {Promise} - Danh sách sản phẩm bán chạy
 */
export const getTopProducts = async (limit = 10, period = 'month', startDate = null, endDate = null) => {
  let params = { limit, period };
  if (period === 'custom' && startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const response = await api.get(`${BASE_API}/top-products`, { params });
  return response;
};

/**
 * Lấy thống kê khách hàng
 * @param {string} period - Khoảng thời gian: 'today', 'week', 'month', 'year', 'custom'
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @returns {Promise} - Thống kê khách hàng
 */
export const getCustomerStatistics = async (period = 'month', startDate = null, endDate = null) => {
  let params = { period };
  if (period === 'custom' && startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const response = await api.get(`${BASE_API}/customers`, { params });
  return response;
};

/**
 * Lấy thống kê theo danh mục sản phẩm
 * @param {string} period - Khoảng thời gian: 'today', 'week', 'month', 'year', 'custom'
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @returns {Promise} - Thống kê theo danh mục sản phẩm
 */
export const getCategoryStatistics = async (period = 'month', startDate = null, endDate = null) => {
  let params = { period };
  if (period === 'custom' && startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const response = await api.get(`${BASE_API}/categories`, { params });
  return response;
};

/**
 * Lấy thống kê đơn hàng
 * @param {string} period - Khoảng thời gian: 'today', 'week', 'month', 'year', 'custom'
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD) - chỉ dùng với period='custom'
 * @returns {Promise} - Thống kê đơn hàng
 */
export const getOrderStatistics = async (period = 'month', startDate = null, endDate = null) => {
  let params = { period };
  if (period === 'custom' && startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const response = await api.get(`${BASE_API}/orders`, { params });
  return response;
};

/**
 * Lấy thống kê tồn kho
 * @returns {Promise} - Thống kê tồn kho
 */
export const getInventoryStatistics = async () => {
  const response = await api.get(`${BASE_API}/inventory`);
  return response;
};
