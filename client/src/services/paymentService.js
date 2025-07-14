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

export const vnpayRefundAPI = async (orderId, reason) => {
  try {
    const response = await axios.post(`${BASE_API}/vnpay/refund`, { orderId, reason });
    console.log('response', response);
    return response;
  } catch (error) {
    console.error('Lỗi khi tạo yêu cầu hoàn tiền VNPay:', error);
    throw error;
  }
};
