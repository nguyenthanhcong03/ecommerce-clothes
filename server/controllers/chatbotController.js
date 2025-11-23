import chatbotService from "../services/chatbotService.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

// Láº¥y thÃ´ng tin tráº¡ng thÃ¡i chatbot
const getChatbotStatus = catchAsync(async (req, res) => {
  const isGeminiConfigured = !!process.env.GEMINI_API_KEY;

  res.status(200).json({
    status: "success",
    data: {
      available: isGeminiConfigured,
      features: {
        naturalLanguageSearch: isGeminiConfigured,
        productRecommendation: true,
        multilingual: isGeminiConfigured,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// Xá»­ lÃ½ chat vá»›i AI
const processChat = catchAsync(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw new ApiError(400, "Tin nháº¯n khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng");
  }

  if (message.trim().length > 500) {
    throw new ApiError(400, "Tin nháº¯n quÃ¡ dÃ i (tá»‘i Ä‘a 500 kÃ½ tá»±)");
  }

  const result = await chatbotService.processChat(message.trim());

  res.status(200).json({
    status: "success",
    data: {
      response: result.message,
      products: result.products,
      totalProducts: result.products.length,
      analysis: result.analysis,
      timestamp: new Date().toISOString(),
    },
  });
});

// Láº¥y gá»£i Ã½ sáº£n pháº©m ná»•i báº­t vÃ  cÃ¢u há»i máº«u
const getChatSuggestions = catchAsync(async (req, res) => {
  const suggestions = await chatbotService.getFeaturedSuggestions();

  res.status(200).json({
    status: "success",
    data: {
      featuredProducts: suggestions.products,
      sampleQuestions: suggestions.suggestions,
      timestamp: new Date().toISOString(),
    },
  });
});

export default {
  processChat,
  getChatSuggestions,
  getChatbotStatus,
};
