const express = require("express");
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/current", verifyToken, authController.getCurrentUser);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/forgot-password/confirm", authController.confirmForgotPassword);
router.post("/refresh-token", authController.refreshToken);
router.post("/change-password", verifyToken, authController.changePassword);
router.get("/check-email/:email", authController.checkEmailExists);

module.exports = router;
