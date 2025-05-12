const express = require("express");
const router = express.Router();
const shippingAddressController = require("../controllers/shippingAddressController");
const { verifyToken } = require("../middlewares/auth");

// Tất cả các routes đều yêu cầu người dùng đã đăng nhập
router.use(verifyToken);

// Lấy tất cả địa chỉ giao hàng
router.get("/", shippingAddressController.getShippingAddresses);

// Thêm địa chỉ giao hàng mới
router.post("/", shippingAddressController.addShippingAddress);

// Cập nhật địa chỉ giao hàng
router.put("/:addressId", shippingAddressController.updateShippingAddress);

// Xóa địa chỉ giao hàng
router.delete("/:addressId", shippingAddressController.deleteShippingAddress);

// Đặt địa chỉ giao hàng mặc định
router.patch("/:addressId/default", shippingAddressController.setDefaultShippingAddress);

module.exports = router;
