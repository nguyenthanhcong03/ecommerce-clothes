import axios from '@/config/axios';
const BASE_API = '/api/coupons';

export const getCouponsAPI = async (params = {}) => {
  console.log('params', params);
  const response = await axios.get(BASE_API, { params });
  return response;
};

export const getCouponByIdAPI = async (id) => {
  const response = await axios.get(`${BASE_API}/${id}`);
  return response;
};

export const createCouponAPI = async (couponData) => {
  const response = await axios.post(BASE_API, couponData);
  return response;
};

export const updateCouponAPI = async (id, updateData) => {
  const response = await axios.put(`${BASE_API}/${id}`, updateData);
  return response;
};

export const deleteCouponAPI = async (id) => {
  const response = await axios.delete(`${BASE_API}/${id}`);
  return response;
};

export const toggleCouponStatusAPI = async (id, isActive) => {
  const response = await axios.patch(`${BASE_API}/${id}/toggle-status`, { isActive });
  return response;
};

export const getActiveCouponsAPI = async () => {
  const response = await axios.get(`${BASE_API}/active`);
  return response;
};

export const validateCouponAPI = async (code, orderTotal = null) => {
  try {
    console.log('orderTotal', orderTotal);
    // const params = orderTotal !== null ? { orderTotal } : {};
    const response = await axios.get(`${BASE_API}/validate/${code}`, {
      params: {
        orderTotal
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    return false;
  }
};

export const calculateDiscount = (coupon, orderTotal) => {
  if (!coupon || !orderTotal) return { discount: 0, finalTotal: orderTotal };

  // let discount = 0;

  // // Kiểm tra nếu đơn hàng đạt giá trị tối thiểu
  // if (orderTotal < coupon.minOrderValue) {
  //   return { discount: 0, finalTotal: orderTotal };
  // }

  // // Tính toán giảm giá dựa vào loại coupon
  // if (coupon.discountType === 'percentage') {
  //   // Giảm theo phần trăm
  //   discount = (orderTotal * coupon.discountValue) / 100;

  //   // Kiểm tra nếu có giới hạn giảm giá tối đa
  //   if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
  //     discount = coupon.maxDiscount;
  //   }
  // } else if (coupon.discountType === 'fixed') {
  //   // Giảm giá cố định
  //   discount = coupon.discountValue;

  //   // Đảm bảo giảm giá không vượt quá tổng đơn hàng
  //   if (discount > orderTotal) {
  //     discount = orderTotal;
  //   }
  console.log('coupon', coupon);
  console.log('orderTotal', orderTotal);
  let discountAmount = 0;

  if (coupon.discountType === 'percentage') {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  // Áp dụng giảm giá tối đa nếu có
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }
  // }

  // const finalTotal = orderTotal - discount;

  // return {
  //   discount,
  //   finalTotal,
  //   couponCode: coupon.code,
  //   couponId: coupon._id
  // };
  return discountAmount;
};
