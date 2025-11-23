import Coupon from "../models/coupon.js";

const incrementCouponUsage = async (couponId) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }, { new: true });

    if (!updatedCoupon) {
      throw new Error("KhÃ´ng tÃ¬m tháº¥y coupon");
    }

    return updatedCoupon;
  } catch (error) {
    throw error;
  }
};

export default {
  incrementCouponUsage,
};
