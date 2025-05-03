const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { verifyToken, checkRole } = require("../middlewares/auth");

// Route công khai
// GET /api/coupons/active - Lấy danh sách coupon đang có hiệu lực (cho khách hàng)
router.get("/active", couponController.getActiveCoupons);

// GET /api/coupons/validate/:code - Kiểm tra mã coupon có hợp lệ không
router.get("/validate/:code", couponController.validateCoupon);

// Routes yêu cầu đăng nhập
// POST /api/coupons/:id/apply - Áp dụng coupon trong đơn hàng
router.post("/:id/apply", verifyToken, couponController.applyCoupon);

// Routes chỉ dành cho admin
// GET /api/coupons - Lấy danh sách coupon có phân trang và lọc
router.get("/", verifyToken, checkRole("admin"), couponController.getCoupons);

// POST /api/coupons - Tạo mới coupon
router.post("/", verifyToken, checkRole("admin"), couponController.createCoupon);

// GET /api/coupons/:id - Lấy thông tin chi tiết của một coupon
router.get("/:id", verifyToken, checkRole("admin"), couponController.getCouponById);

// PUT /api/coupons/:id - Cập nhật thông tin coupon
router.put("/:id", verifyToken, checkRole("admin"), couponController.updateCoupon);

// DELETE /api/coupons/:id - Xóa coupon
router.delete("/:id", verifyToken, checkRole("admin"), couponController.deleteCoupon);

// PATCH /api/coupons/:id/toggle-status - Cập nhật trạng thái kích hoạt của coupon
router.patch("/:id/toggle-status", verifyToken, checkRole("admin"), couponController.toggleCouponStatus);

module.exports = router;
