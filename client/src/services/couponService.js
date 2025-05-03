import axiosClient from './axiosClient';
const BASE_API = '/api/coupons';

export const getCoupons = async (params = {}) => {
  const response = await axiosClient.get(BASE_API, { params });
  return response;
};

/**
 * Lấy thông tin chi tiết của một coupon
 * @param {String} id ID của coupon
 * @returns {Promise<Object>} Thông tin chi tiết coupon
 */
export const getCouponById = async (id) => {
  const response = await axiosClient.get(`${BASE_API}/${id}`);
  return response;
};

/**
 * Tạo mới coupon
 * @param {Object} couponData Dữ liệu coupon cần tạo
 * @returns {Promise<Object>} Kết quả trả về từ API
 */
export const createCoupon = async (couponData) => {
  const response = await axiosClient.post(BASE_API, couponData);
  return response;
};

/**
 * Cập nhật thông tin coupon
 * @param {String} id ID của coupon
 * @param {Object} updateData Dữ liệu cập nhật
 * @returns {Promise<Object>} Kết quả trả về từ API
 */
export const updateCoupon = async (id, updateData) => {
  const response = await axiosClient.put(`${BASE_API}/${id}`, updateData);
  return response;
};

/**
 * Xóa coupon
 * @param {String} id ID của coupon
 * @returns {Promise<Object>} Kết quả trả về từ API
 */
export const deleteCoupon = async (id) => {
  const response = await axiosClient.delete(`${BASE_API}/${id}`);
  return response;
};

/**
 * Cập nhật trạng thái kích hoạt của coupon
 * @param {String} id ID của coupon
 * @param {Boolean} isActive Trạng thái kích hoạt
 * @returns {Promise<Object>} Kết quả trả về từ API
 */
export const toggleCouponStatus = async (id, isActive) => {
  const response = await axiosClient.patch(`${BASE_API}/${id}/toggle-status`, { isActive });
  return response;
};

/**
 * Lấy danh sách coupon đang có hiệu lực (dành cho khách hàng)
 * @returns {Promise<Object>} Kết quả trả về từ API
 */
export const getActiveCoupons = async () => {
  const response = await axiosClient.get(`${BASE_API}/active`);
  return response;
};

/**
 * Kiểm tra mã coupon có hợp lệ không
 * @param {String} code Mã coupon cần kiểm tra
 * @param {Number} orderTotal Tổng giá trị đơn hàng (tùy chọn)
 * @returns {Promise<Object>} Kết quả trả về từ API
 */
export const validateCoupon = async (code, orderTotal = null) => {
  const params = orderTotal !== null ? { orderTotal } : {};
  const response = await axiosClient.get(`${BASE_API}/validate/${code}`, { params });
  return response;
};

/**
 * Áp dụng coupon vào đơn hàng
 * @param {String} id ID của coupon
 * @returns {Promise<Object>} Kết quả trả về từ API
 */
export const applyCoupon = async (id) => {
  const response = await axiosClient.post(`${BASE_API}/${id}/apply`);
  return response;
};

/**
 * Tính toán giá trị giảm giá dựa trên thông tin coupon và tổng giá trị đơn hàng
 * @param {Object} coupon Thông tin coupon
 * @param {Number} orderTotal Tổng giá trị đơn hàng
 * @returns {Object} Kết quả tính toán giảm giá
 */
export const calculateDiscount = (coupon, orderTotal) => {
  if (!coupon || !orderTotal) return { discount: 0, finalTotal: orderTotal };

  let discount = 0;

  // Kiểm tra nếu đơn hàng đạt giá trị tối thiểu
  if (orderTotal < coupon.minOrderValue) {
    return { discount: 0, finalTotal: orderTotal };
  }

  // Tính toán giảm giá dựa vào loại coupon
  if (coupon.type === 'percentage') {
    // Giảm theo phần trăm
    discount = (orderTotal * coupon.value) / 100;

    // Kiểm tra nếu có giới hạn giảm giá tối đa
    if (coupon.maxDiscountValue > 0 && discount > coupon.maxDiscountValue) {
      discount = coupon.maxDiscountValue;
    }
  } else if (coupon.type === 'fixed') {
    // Giảm giá cố định
    discount = coupon.value;

    // Đảm bảo giảm giá không vượt quá tổng đơn hàng
    if (discount > orderTotal) {
      discount = orderTotal;
    }
  }

  const finalTotal = orderTotal - discount;

  return {
    discount,
    finalTotal,
    couponCode: coupon.code,
    couponId: coupon._id
  };
};

const couponService = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getActiveCoupons,
  validateCoupon,
  applyCoupon,
  calculateDiscount
};

export default couponService;
