const express = require("express");
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/current", verifyToken, authController.getCurrentUser);
router.post("/logout", verifyToken, authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/forgot-password/confirm", authController.confirmForgotPassword);
router.get("/verify-email", authController.verifyEmail);
router.post("/refresh-token", authController.refreshToken);
router.post("/change-password", verifyToken, authController.changePassword);

module.exports = router;
