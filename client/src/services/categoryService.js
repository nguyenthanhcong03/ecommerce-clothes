import axiosClient from './axiosClient';
const BASE_API = '/api/category';

/**
 * Lấy tất cả danh mục với các tùy chọn lọc và phân trang
 * @param {Object} params Các tham số truy vấn {page, limit, search}
 * @returns {Promise} Kết quả từ API chứa danh sách danh mục và thông tin phân trang
 */
export const getAllCategoriesAPI = async ({ page = 1, limit = 10, search = '' }) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    search
  }).toString();
  const url = `${BASE_API}?${queryParams}`;
  return await axiosClient.get(url);
};

/**
 * Tạo danh mục mới
 * @param {Object} data Dữ liệu danh mục cần tạo (bao gồm name, description, images...)
 * @returns {Promise} Kết quả từ API sau khi tạo danh mục
 */
export const createCategoryAPI = async (data) => {
  return await axiosClient.post(BASE_API, data);
};

/**
 * Cập nhật danh mục theo ID
 * @param {String} id ID của danh mục cần cập nhật
 * @param {Object} data Dữ liệu danh mục cần cập nhật
 * @returns {Promise} Kết quả từ API sau khi cập nhật danh mục
 */
export const updateCategoryByIdAPI = async (id, data) => {
  return await axiosClient.put(`${BASE_API}/${id}`, data);
};

/**
 * Xóa danh mục theo ID
 * @param {String} id ID của danh mục cần xóa
 * @returns {Promise} Kết quả từ API sau khi xóa danh mục
 */
export const deleteCategoryByIdAPI = async (id) => {
  return await axiosClient.delete(`${BASE_API}/${id}`);
};

/**
 * Lấy danh mục theo ID
 * @param {String} id ID của danh mục cần lấy
 * @returns {Promise} Kết quả từ API chứa thông tin danh mục
 */
export const getCategoryByIdAPI = async (id) => {
  return await axiosClient.get(`${BASE_API}/${id}`);
};

/**
 * Lấy cây danh mục (cấu trúc phân cấp)
 * @param {Boolean} onlyActive Chỉ lấy các danh mục đang hoạt động
 * @returns {Promise} Kết quả từ API chứa cây danh mục
 */
export const getCategoryTreeAPI = async (onlyActive = true) => {
  const url = `${BASE_API}/tree?onlyActive=${onlyActive}`;
  return await axiosClient.get(url);
};
