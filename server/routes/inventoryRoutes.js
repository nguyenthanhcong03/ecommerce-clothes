const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { verifyToken, checkRole } = require("../middlewares/auth");

// Tất cả các routes đều yêu cầu xác thực và phải là admin
router.use(verifyToken, checkRole("admin"));

// Cập nhật số lượng tồn kho cho một biến thể
router.patch("/products/:productId/variants/:variantId/stock", inventoryController.updateVariantStock);

// Cập nhật hàng loạt số lượng tồn kho
router.post("/bulk-update", inventoryController.bulkUpdateStock);

// Lấy danh sách sản phẩm có tồn kho thấp
router.get("/low-stock", inventoryController.getLowStockProducts);

// Lấy lịch sử xuất nhập kho
router.get("/history", inventoryController.getInventoryHistory);

module.exports = router;
