import axios from '@/config/axios';
const BASE_API = 'api/payment';

export const createVnpayPayment = async (orderId) => {
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
export const createMomoPayment = async (payload) => {
  try {
    const response = await axios.post(`${BASE_API}/momo/create`, payload);
    return response;
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán MoMo:', error);
    throw error;
  }
};

/**
 * Chuyển hướng người dùng đến cổng thanh toán
 * @param {string} paymentUrl - URL thanh toán trả về từ cổng thanh toán
 */
export const redirectToPaymentGateway = (paymentUrl) => {
  if (!paymentUrl) return;
  window.location.href = paymentUrl;
};

/**
 * Xử lý thanh toán sử dụng cổng thanh toán đã chọn
 * @param {string} paymentMethod - Phương thức thanh toán (vnpay hoặc momo)
 * @param {Object} orderData - Thông tin đơn hàng
 * @returns {Promise<void>} - Promise hoàn thành khi chuyển hướng xảy ra
 */
export const processPayment = async (paymentMethod, orderData) => {
  try {
    let response;

    switch (paymentMethod) {
      case 'VNPay':
        response = await createVnpayPayment(orderData);
        break;
      case 'Momo':
        response = await createMomoPayment(orderData);
        break;
      default:
        throw new Error('Phương thức thanh toán không được hỗ trợ');
    }
    if (response && response.data && response.data.paymentUrl) {
      redirectToPaymentGateway(response.data.paymentUrl);
      return response;
    } else {
      throw new Error('Phản hồi thanh toán không hợp lệ');
    }
  } catch (error) {
    console.error(`Lỗi khi xử lý thanh toán ${paymentMethod}:`, error);
    throw error;
  }
};
