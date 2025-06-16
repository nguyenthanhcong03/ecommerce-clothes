const couponService = require("../services/couponService");
const { Error } = require("mongoose");

const createCoupon = async (req, res) => {
  try {
    const couponData = req.body;
    const newCoupon = await couponService.createCoupon(couponData);
    res.status(201).json({
      success: true,
      message: "Đã tạo mã giảm giá thành công",
      data: newCoupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi tạo mã giảm giá",
    });
  }
};

const getCoupons = async (req, res) => {
  try {
    const result = await couponService.getCoupons(req.query);
    res.status(200).json({
      success: true,
      message: "Lấy danh sách mã giảm giá thành công",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi lấy danh sách mã giảm giá",
    });
  }
};

const getCouponById = async (req, res) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin mã giảm giá thành công",
      data: coupon,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy mã giảm giá",
    });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const { orderTotal } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã giảm giá",
      });
    }

    const coupon = await couponService.getCouponByCode(code);

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderTotal && parseFloat(orderTotal) < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng phải có giá trị tối thiểu ${coupon.minOrderValue.toLocaleString(
          "vi-VN"
        )} VND để sử dụng mã giảm giá này`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Mã giảm giá hợp lệ",
      data: coupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Mã giảm giá không hợp lệ",
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedCoupon = await couponService.updateCoupon(id, updateData);

    res.status(200).json({
      success: true,
      message: "Đã cập nhật mã giảm giá thành công",
      data: updatedCoupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi cập nhật mã giảm giá",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await couponService.deleteCoupon(id);

    res.status(200).json({
      success: true,
      message: "Đã xóa mã giảm giá thành công",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi xóa mã giảm giá",
    });
  }
};

const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp trạng thái kích hoạt (isActive)",
      });
    }

    const updatedCoupon = await couponService.toggleCouponStatus(id, isActive);

    res.status(200).json({
      success: true,
      message: `Đã ${isActive ? "kích hoạt" : "vô hiệu hóa"} mã giảm giá thành công`,
      data: updatedCoupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi cập nhật trạng thái mã giảm giá",
    });
  }
};

const getActiveCoupons = async (req, res) => {
  console.log("first");
  try {
    const coupons = await couponService.getActiveCoupons();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách mã giảm giá đang có hiệu lực thành công",
      data: coupons,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi lấy danh sách mã giảm giá",
    });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getActiveCoupons,
};
