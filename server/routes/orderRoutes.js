const express = require("express");
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  searchOrders,
  processRefund,
} = require("../controllers/orderController");
const { verifyToken, checkRole } = require("../middlewares/auth");

const router = express.Router();

// User routes
router.post("/", verifyToken, createOrder);
router.get("/user", verifyToken, getUserOrders);
router.get("/:id", verifyToken, getOrderById);
router.post("/:id/cancel", verifyToken, cancelOrder);
router.get("/search", verifyToken, searchOrders);

// Admin routes
router.get("/", verifyToken, checkRole("admin"), getAllOrders);
router.patch("/:id/status", verifyToken, checkRole("admin"), updateOrderStatus);
router.patch("/:id/payment", verifyToken, checkRole("admin"), updatePaymentStatus);

module.exports = router;
