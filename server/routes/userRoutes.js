const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middlewares/verifyToken");
const { protect, admin } = require("../middlewares/auth");

// router.post("/register", userController.register);
// router.post("/login", userController.login);
// router.get("/current", verifyToken, userController.getCurrentUser);
// router.post("/refreshtoken", userController.refreshAccessToken);
// router.get("/logout", verifyToken, userController.logout);
// router.get("/forgotpassword", verifyToken, userController.forgotPassword);
// router.get("/", [verifyToken, isAdmin], userController.getUsers);
router.get("/", protect, admin, userController.getUsers);

// router.get("/profile", protect, (req, res) => {
//   res.json({ message: "Thông tin người dùng", user: req.user });
// });

// router.get("/admin", protect, admin, (req, res) => {
//   res.json({ message: "Trang quản trị - Chỉ Admin mới thấy" });
// });

module.exports = router;
