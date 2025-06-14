const express = require("express");
const statisticsController = require("../controllers/statisticsController");
const { verifyAccessToken, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// Middleware xác thực quyền admin cho tất cả các route
// router.use(verifyAccessToken, isAdmin);

// Lấy thống kê tổng quan
router.get("/overview", statisticsController.getOverviewStatistics);

// Lấy thống kê doanh thu
router.get("/revenue", statisticsController.getRevenueStatistics);

// Lấy thống kê sản phẩm bán chạy
router.get("/top-products", statisticsController.getTopProducts);

// Lấy thống kê khách hàng
router.get("/customers", statisticsController.getCustomerStatistics);

// Lấy thống kê theo danh mục sản phẩm
router.get("/categories", statisticsController.getCategoryStatistics);

// Lấy thống kê đơn hàng
router.get("/orders", statisticsController.getOrderStatistics);

// Lấy thống kê tồn kho
router.get("/inventory", statisticsController.getInventoryStatistics);

module.exports = router;
