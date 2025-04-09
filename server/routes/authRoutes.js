const express = require("express");
const {
  register,
  login,
  logout,
  forgotPassword,
  verifyEmail,
  changePassword,
  confirmForgotPassword,
  refreshToken,
  getCurrentUser,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/current", authMiddleware.protect, getCurrentUser);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/confirm", confirmForgotPassword);
router.get("/verify-email", verifyEmail);
router.post("/refresh-token", refreshToken);
router.post("/change-password", authMiddleware.protect, changePassword);

module.exports = router;
