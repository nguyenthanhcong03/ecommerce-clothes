const express = require("express");
const { verifyToken, checkRole } = require("../middlewares/auth");
const {
  createVnpayPayment,
  vnpayReturn,
  createMomoPayment,
  momoReturn,
  momoIpn,
  createVnpayPayment2,
  vnpayReturn2,
} = require("../controllers/paymentController");

const router = express.Router();

// Route thanh toán VNPay
router.post("/vnpay/create", verifyToken, createVnpayPayment2); // Tạo URL thanh toán VNPay (yêu cầu đăng nhập)
router.get("/vnpay/return", vnpayReturn2); // Xử lý kết quả trả về từ VNPay (công khai)

// Route thanh toán MoMo
router.post("/momo/create", verifyToken, createMomoPayment); // Tạo URL thanh toán MoMo (yêu cầu đăng nhập)
router.get("/momo/return", momoReturn); // Xử lý kết quả trả về từ MoMo (công khai)
router.post("/momo/ipn", momoIpn); // Xử lý thông báo thanh toán tức thì từ MoMo (công khai)

module.exports = router;
