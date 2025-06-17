const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middlewares/auth");
const validator = require("../middlewares/validator");
const { updateSchema, idSchema, passwordUpdateSchema, registerSchema } = require("../validation/userValidation");

// Lấy thông tin của người dùng hiện tại
router.get("/me", verifyToken, userController.getCurrentUser);

// Lấy danh sách tất cả người dùng (chỉ admin)
router.get("/", verifyToken, checkRole("admin"), userController.getAllUsers);

// Tạo người dùng mới (chỉ admin)
router.post(
  "/admin/create",
  verifyToken,
  checkRole("admin"),
  // validator(registerSchema),
  userController.createUserByAdmin
);

// Lấy thông tin của một người dùng cụ thể
router.get("/:id", verifyToken, validator(idSchema, "params"), userController.getUserById);

// Cập nhật thông tin người dùng
router.put("/:id", verifyToken, userController.updateUser);
// router.put("/:id", verifyToken, validator(updateSchema), userController.updateUser);

// Cập nhật thông tin người dùng bởi Admin (có nhiều quyền hạn hơn)
router.put(
  "/admin/:id",
  verifyToken,
  checkRole("admin"),
  // validator(idSchema, "params"),
  // validator(updateSchema),
  userController.updateUserByAdmin
);

// Thay đổi mật khẩu
router.put("/password/change", verifyToken, validator(passwordUpdateSchema), userController.changePassword);

// Chặn người dùng (chỉ admin)
router.put("/:id/ban", verifyToken, checkRole("admin"), userController.banUser);

// Bỏ chặn người dùng (chỉ admin)
router.put("/:id/unban", verifyToken, checkRole("admin"), userController.unbanUser);

// Xóa người dùng (chỉ admin)
router.delete("/:id", verifyToken, checkRole("admin"), userController.deleteUser);

module.exports = router;
