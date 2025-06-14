import axios from '@/config/axios';
const BASE_API = '/api/category';

/**
 * Lấy tất cả danh mục với các tùy chọn lọc và phân trang
 * @param {Object} params Các tham số truy vấn {page, limit, search}
 * @returns {Promise} Kết quả từ API chứa danh sách danh mục và thông tin phân trang
 */
export const getAllCategoriesAPI = async () => {
  const url = `${BASE_API}`;
  return await axios.get(url);
};

/**
 * Tạo danh mục mới
 * @param {Object} data Dữ liệu danh mục cần tạo (bao gồm name, description, images...)
 * @returns {Promise} Kết quả từ API sau khi tạo danh mục
 */
export const createCategoryAPI = async (data) => {
  return await axios.post(BASE_API, data);
};

/**
 * Cập nhật danh mục theo ID
 * @param {String} id ID của danh mục cần cập nhật
 * @param {Object} data Dữ liệu danh mục cần cập nhật
 * @returns {Promise} Kết quả từ API sau khi cập nhật danh mục
 */
export const updateCategoryByIdAPI = async (id, data) => {
  return await axios.put(`${BASE_API}/${id}`, data);
};

/**
 * Xóa danh mục theo ID
 * @param {String} id ID của danh mục cần xóa
 * @returns {Promise} Kết quả từ API sau khi xóa danh mục
 */
export const deleteCategoryByIdAPI = async (id) => {
  return await axios.delete(`${BASE_API}/${id}`);
};

/**
 * Lấy danh mục theo ID
 * @param {String} id ID của danh mục cần lấy
 * @returns {Promise} Kết quả từ API chứa thông tin danh mục
 */
export const getCategoryByIdAPI = async (id) => {
  return await axios.get(`${BASE_API}/${id}`);
};

/**
 * Lấy cây danh mục (cấu trúc phân cấp)
 * @param {Boolean} onlyActive Chỉ lấy các danh mục đang hoạt động
 * @returns {Promise} Kết quả từ API chứa cây danh mục
 */
export const getCategoryTreeAPI = async () => {
  const url = `${BASE_API}/tree`;
  return await axios.get(url);
};
