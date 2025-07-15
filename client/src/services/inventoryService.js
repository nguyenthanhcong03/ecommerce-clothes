import axiosClient from '../config/axios';
const BASE_API = '/api/inventory';

const inventoryService = {
  // Lấy danh sách sản phẩm có tồn kho thấp
  getLowStockProducts: async (params = {}) => {
    const { threshold = 5, page = 1, limit = 20 } = params;
    const response = await axiosClient.get(`${BASE_API}/low-stock`, {
      params: { threshold, page, limit }
    });
    return response;
  },

  // Cập nhật số lượng tồn kho cho một biến thể
  updateVariantStock: async (productId, variantId, data) => {
    const response = await axiosClient.patch(`${BASE_API}/products/${productId}/variants/${variantId}/stock`, data);
    return response;
  },

  // Cập nhật hàng loạt số lượng tồn kho
  bulkUpdateStock: async (data) => {
    const response = await axiosClient.post(`${BASE_API}/bulk-update`, data);
    return response;
  },

  // Lấy lịch sử xuất nhập kho
  getInventoryHistory: async (params = {}) => {
    const response = await axiosClient.get(`${BASE_API}/history`, { params });
    return response;
  }
};

export default inventoryService;
