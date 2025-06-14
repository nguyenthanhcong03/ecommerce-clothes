const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Route thanh toán VNPay
router.post("/vnpay/create", verifyToken, paymentController.createVnpayPayment); // Tạo URL thanh toán VNPay (yêu cầu đăng nhập)
router.get("/vnpay/return", paymentController.vnpayReturn); // Xử lý kết quả trả về từ VNPay (công khai)

// Route thanh toán MoMo
router.post("/momo/create", verifyToken, paymentController.createMomoPayment); // Tạo URL thanh toán MoMo (yêu cầu đăng nhập)
router.get("/momo/return", paymentController.momoReturn); // Xử lý kết quả trả về từ MoMo (công khai)
router.post("/momo/ipn", paymentController.momoIpn); // Xử lý thông báo thanh toán tức thì từ MoMo (công khai)

module.exports = router;
