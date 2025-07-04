const Coupon = require("../models/coupon");
const { Error } = require("mongoose");

const createCoupon = async (couponData) => {
  try {
    // Kiểm tra ngày bắt đầu và kết thúc
    if (new Date(couponData.startDate) > new Date(couponData.endDate)) {
      throw new Error("Ngày bắt đầu không thể sau ngày kết thúc");
    }

    // Chuyển mã code sang chữ hoa
    couponData.code = couponData.code.toUpperCase();

    // Kiểm tra trùng lặp mã coupon
    const existingCoupon = await Coupon.findOne({ code: couponData.code });
    if (existingCoupon) {
      throw new Error("Mã coupon đã tồn tại");
    }

    const newCoupon = await Coupon.create(couponData);

    return newCoupon;
  } catch (error) {
    throw error;
  }
};

const getCoupons = async (query) => {
  try {
    const { page = 1, limit = 10, search, isActive, code, startDate, endDate } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Xây dựng điều kiện lọc
    const filter = {};

    // Text search if provided
    if (search) {
      filter.$or = [{ code: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];

      // Alternative: Use the text index if search term contains multiple words
      // if (search.includes(' ')) {
      //   filter.$text = { $search: search };
      // } else {
      //   filter.$or = [
      //     { name: { $regex: search, $options: 'i' } },
      //     { description: { $regex: search, $options: 'i' } }
      //   ];
      // }
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (code) {
      filter.code = { $regex: new RegExp(code, "i") };
    }

    if (startDate) {
      if (!filter.startDate) filter.startDate = {};
      filter.startDate.$gte = new Date(startDate);
    }

    if (endDate) {
      if (!filter.endDate) filter.endDate = {};
      filter.endDate.$lte = new Date(endDate);
    }

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    const total = await Coupon.countDocuments(filter);

    return {
      coupons,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  } catch (error) {
    throw error;
  }
};

const getCouponById = async (couponId) => {
  try {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Không tìm thấy coupon");
    }
    return coupon;
  } catch (error) {
    throw error;
  }
};

const getCouponByCode = async (code) => {
  try {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!coupon) {
      throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new Error("Mã giảm giá đã hết lượt sử dụng");
    }

    return coupon;
  } catch (error) {
    throw error;
  }
};

const updateCoupon = async (couponId, updateData) => {
  try {
    // Kiểm tra ngày nếu cập nhật cả startDate và endDate
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) > new Date(updateData.endDate)) {
        throw new Error("Ngày bắt đầu không thể sau ngày kết thúc");
      }
    }

    // Nếu cập nhật mã code, chuyển sang chữ hoa
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();

      // Kiểm tra trùng lặp
      const existingCoupon = await Coupon.findOne({
        code: updateData.code,
        _id: { $ne: couponId },
      });

      if (existingCoupon) {
        throw new Error("Mã coupon đã tồn tại");
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true, runValidators: true });

    if (!updatedCoupon) {
      throw new Error("Không tìm thấy coupon");
    }

    return updatedCoupon;
  } catch (error) {
    throw error;
  }
};

const deleteCoupon = async (couponId) => {
  try {
    // Kiểm tra coupon có tồn tại không
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Không tìm thấy coupon");
    }

    // Kiểm tra coupon đã được sử dụng chưa
    if (coupon.usedCount > 0) {
      throw new Error("Không thể xóa coupon đã được sử dụng");
    }

    const result = await Coupon.findByIdAndDelete(couponId);
    return { success: true, message: "Đã xóa coupon thành công" };
  } catch (error) {
    throw error;
  }
};

const toggleCouponStatus = async (couponId, isActive) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { isActive }, { new: true });

    if (!updatedCoupon) {
      throw new Error("Không tìm thấy coupon");
    }

    return updatedCoupon;
  } catch (error) {
    throw error;
  }
};

/**
 * Tăng số lượt sử dụng của coupon
 * @param {String} couponId ID của coupon
 * @returns {Promise<Object>} Coupon đã cập nhật
 */
const incrementCouponUsage = async (couponId) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }, { new: true });

    if (!updatedCoupon) {
      throw new Error("Không tìm thấy coupon");
    }

    return updatedCoupon;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách coupon có hiệu lực
 * @returns {Promise<Array>} Danh sách coupon
 */
const getActiveCoupons = async () => {
  try {
    const now = new Date();
    // Lấy tất cả coupon hoạt động trong ngày và lọc thêm sau
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    // Lọc những coupon còn lượt sử dụng
    const filteredCoupons = coupons.filter((coupon) => coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit);

    return filteredCoupons;
    // return coupons;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  incrementCouponUsage,
  getActiveCoupons,
};
