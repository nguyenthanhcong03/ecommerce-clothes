const express = require("express");
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/auth");
const validator = require("../middlewares/validator");
const { registerSchema, loginSchema, passwordUpdateSchema } = require("../validation/userValidation");

const router = express.Router();

router.post("/register", validator(registerSchema), authController.register);
router.post("/login", validator(loginSchema), authController.login);
router.get("/current", verifyToken, authController.getCurrentUser);
router.post("/logout", verifyToken, authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/forgot-password/confirm", authController.confirmForgotPassword);
router.get("/verify-email", authController.verifyEmail);
router.post("/refresh-token", authController.refreshToken);
router.post("/change-password", verifyToken, validator(passwordUpdateSchema), authController.changePassword);

module.exports = router;
