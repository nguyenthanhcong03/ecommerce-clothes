const express = require("express");
const reviewController = require("../controllers/reviewController");
const { verifyToken, checkRole } = require("../middlewares/auth");

const router = express.Router();

// Các routes công khai (không cần đăng nhập)
// Lấy tất cả đánh giá của một sản phẩm
router.get("/product/:productId", reviewController.getProductReviews);

// Các routes yêu cầu xác thực (đăng nhập)
// Tạo đánh giá mới cho sản phẩm đã mua
router.post("/", verifyToken, reviewController.createReview);
// Lấy tất cả đánh giá của người dùng hiện tại
router.get("/user", verifyToken, reviewController.getUserReviews);
// Lấy danh sách sản phẩm có thể đánh giá từ một đơn hàng đã giao
router.get("/order/:orderId/reviewable", verifyToken, reviewController.getReviewableProducts);

// Các routes dành cho admin
// Lấy tất cả đánh giá (Admin only)
router.get("/all", verifyToken, checkRole("admin"), reviewController.getAllReviews);
// Thêm phản hồi của shop/admin vào đánh giá
router.patch("/:reviewId/reply", verifyToken, checkRole("admin"), reviewController.replyToReview);

module.exports = router;
