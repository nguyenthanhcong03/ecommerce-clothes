const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const { validateChatMessage } = require("../middlewares/validator");

// POST /api/chatbot/chat - Xử lý tin nhắn chat
router.post("/chat", validateChatMessage, chatbotController.processChat);

// GET /api/chatbot/suggestions - Lấy gợi ý sản phẩm và câu hỏi mẫu
router.get("/suggestions", chatbotController.getChatSuggestions);

// GET /api/chatbot/status - Kiểm tra trạng thái chatbot
router.get("/status", chatbotController.getChatbotStatus);

module.exports = router;
