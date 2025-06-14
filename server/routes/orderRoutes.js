const express = require("express");
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStatistics,
  cancelOrder,
  searchOrders,
  reviewOrder,
} = require("../controllers/orderController");
const { verifyToken, checkRole } = require("../middlewares/auth");

const router = express.Router();

// User routes
router.post("/", verifyToken, createOrder); // Tạo đơn hàng - COD hoặc online payment
router.get("/user", verifyToken, getUserOrders);
router.get("/:id", verifyToken, getOrderById);
router.post("/:id/cancel", verifyToken, cancelOrder);
router.post("/:id/review", verifyToken, reviewOrder);
router.get("/search", verifyToken, searchOrders);

// Admin routes
router.get("/", verifyToken, checkRole("admin"), getAllOrders);
router.get("/statistics/dashboard", verifyToken, checkRole("admin"), getOrderStatistics);
router.patch("/:id/status", verifyToken, checkRole("admin"), updateOrderStatus);
router.patch("/:id/payment", verifyToken, checkRole("admin"), updatePaymentStatus);

module.exports = router;
