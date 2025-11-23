import express from "express";
import { verifyToken  } from "../middlewares/auth.js";
import paymentController from "../controllers/paymentController.js";

const router = express.Router();

// Route thanh toÃ¡n VNPay
router.post("/vnpay/create", verifyToken, paymentController.createVnpayPayment); // Táº¡o URL thanh toÃ¡n VNPay (yÃªu cáº§u Ä‘Äƒng nháº­p)
router.get("/vnpay/return", paymentController.vnpayReturn); // Xá»­ lÃ½ káº¿t quáº£ tráº£ vá» tá»« VNPay (cÃ´ng khai)

// Route hoÃ n tiá»n VNPay
router.post("/vnpay/refund", verifyToken, paymentController.vnpayRefund); // Táº¡o yÃªu cáº§u hoÃ n tiá»n (yÃªu cáº§u Ä‘Äƒng nháº­p)

export default router;


