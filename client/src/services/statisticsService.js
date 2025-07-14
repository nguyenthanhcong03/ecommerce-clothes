import api from '@/config/axios';

const BASE_API = '/api/statistics';

/**
 * Lấy thống kê tổng quan
 */
export const getOverviewStatistics = async () => {
  const response = await api.get(`${BASE_API}/overview`);
  return response;
};

/**
 * Lấy thống kê doanh thu
 */
export const getRevenueStatistics = async (period = 'month', startDate = null, endDate = null) => {
  let params = { period };
  if (period === 'custom' && startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const response = await api.get(`${BASE_API}/revenue`, { params });
  return response;
};

/**
 * Lấy thống kê sản phẩm bán chạy
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
 */
export const getInventoryStatistics = async () => {
  const response = await api.get(`${BASE_API}/inventory`);
  return response;
};
