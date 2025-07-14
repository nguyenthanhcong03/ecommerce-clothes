const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Route thanh toán VNPay
router.post("/vnpay/create", verifyToken, paymentController.createVnpayPayment); // Tạo URL thanh toán VNPay (yêu cầu đăng nhập)
router.get("/vnpay/return", paymentController.vnpayReturn); // Xử lý kết quả trả về từ VNPay (công khai)

// Route hoàn tiền VNPay
router.post("/vnpay/refund", verifyToken, paymentController.vnpayRefund); // Tạo yêu cầu hoàn tiền (yêu cầu đăng nhập)

module.exports = router;
