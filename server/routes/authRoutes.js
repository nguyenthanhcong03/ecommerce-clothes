const express = require("express");
const { register, login, forgotPassword, verifyEmail, changePassword } = require("../controllers/authController");
const { refreshToken } = require("../services/authService");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
// router.get('/confirm-email', async (req, res) => {
//   const { token } = req.query;

//   try {
//       const decoded = jwt.verify(token, process.env.EMAIL_SECRET);

//       // Kiểm tra nếu tài khoản đã được xác nhận trước đó
//       const existingUser = await User.findOne({ email: decoded.email });
//       if (existingUser) {
//           return res.status(400).json({ message: "Tài khoản đã được xác nhận trước đó." });
//       }

//       // Tạo tài khoản sau khi người dùng xác nhận email
//       const newUser = new User({
//           fullName: decoded.fullName,
//           email: decoded.email,
//           password: decoded.password
//       });

//       await newUser.save();

//       res.status(200).json({ message: "Tài khoản đã được xác nhận thành công." });
//   } catch (error) {
//       return res.status(400).json({ message: "Liên kết xác nhận không hợp lệ hoặc đã hết hạn." });
//   }
// });
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/refresh-token", refreshToken);
router.post("/change-password", authMiddleware.protect, changePassword);

module.exports = router;
