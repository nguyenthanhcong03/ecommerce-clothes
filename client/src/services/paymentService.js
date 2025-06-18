import axios from '@/config/axios';
const BASE_API = 'api/payment';

export const createVnpayPaymentAPI = async (orderId) => {
  console.log('orderId', orderId);
  try {
    const response = await axios.post(`${BASE_API}/vnpay/create`, { orderId });
    console.log('response', response);
    return response;
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán VNPay:', error);
    throw error;
  }
};

/**
 * Tạo URL thanh toán MoMo để chuyển hướng người dùng đến cổng thanh toán MoMo
 * @param {Object} payload - Thông tin thanh toán
 * @param {number} payload.amount - Số tiền thanh toán (VNĐ)
 * @param {string} payload.orderId - Mã đơn hàng
 * @param {string} payload.orderInfo - Mô tả đơn hàng
 * @returns {Promise<Object>} - Phản hồi chứa URL thanh toán
 */
export const createMomoPaymentAPI = async (payload) => {
  try {
    const response = await axios.post(`${BASE_API}/momo/create`, payload);
    return response;
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán MoMo:', error);
    throw error;
  }
};
