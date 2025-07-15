const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/product");
const Category = require("../models/category");

// Khởi tạo Google Generative AI và model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Phân tích ý định và thông tin từ tin nhắn của người dùng
async function analyzeUserIntent(message) {
  try {
    const prompt = `
      Bạn là một AI assistant chuyên phân tích yêu cầu tìm kiếm sản phẩm của khách hàng trong cửa hàng thời trang.
      
      Hãy phân tích tin nhắn sau và trích xuất thông tin tìm kiếm theo định dạng JSON:
      
      Tin nhắn: "${message}"
      
      Hãy trả về JSON với cấu trúc sau:
      {
        "intent": "search_product" | "get_info" | "other",
        "searchParams": {
          "keywords": ["keyword1", "keyword2"],
          "category": "tên danh mục hoặc null",
          "brand": "tên thương hiệu hoặc null",
          "priceRange": {
            "min": số hoặc null,
            "max": số hoặc null
          },
          "color": "màu sắc hoặc null",
          "size": "kích thước hoặc null",
        },
        "question": "câu hỏi cụ thể nếu có"
      }
      
      Lưu ý:
      - Nếu không có thông tin cụ thể nào, để null
      - Keywords nên chứa các từ khóa chính liên quan đến sản phẩm
      - Category có thể là: "Áo nam", "Áo nữ", "Quần nam", "Quần nữ"
      - Chỉ trả về JSON, không có text khác
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    console.log("content", content);

    // Làm sạch response để chỉ lấy JSON
    let jsonString = content;
    if (content.includes("```json")) {
      jsonString = content.split("```json")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      jsonString = content.split("```")[1].trim();
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing user intent:", error);
    return {
      intent: "search_product",
      searchParams: {
        keywords: message.split(" ").filter((word) => word.length > 2),
        category: null,
        brand: null,
        priceRange: { min: null, max: null },
        color: null,
        size: null,
      },
      question: null,
    };
  }
}

// Tìm kiếm sản phẩm dựa trên thông tin đã phân tích
async function searchProducts(searchParams, limit = 10) {
  try {
    let query = {};
    let sort = {};

    // Tìm kiếm theo keywords
    if (searchParams.keywords && searchParams.keywords.length > 0) {
      console.log("search_product", searchParams);
      const keywordRegex = searchParams.keywords.map((keyword) => new RegExp(keyword, "i"));
      query.$or = [
        { name: { $in: keywordRegex } },
        { description: { $in: keywordRegex } },
        { tags: { $in: keywordRegex } },
        { brand: { $in: keywordRegex } },
      ];
    }

    // Tìm kiếm theo category
    if (searchParams.category) {
      const category = await Category.findOne({
        name: new RegExp(searchParams.category, "i"),
      });
      if (category) {
        query.categoryId = category._id;
      }
    }

    // Tìm kiếm theo brand
    if (searchParams.brand) {
      query.brand = new RegExp(searchParams.brand, "i");
    }

    // Tìm kiếm theo giá
    if (searchParams.priceRange && (searchParams.priceRange.min || searchParams.priceRange.max)) {
      let priceQuery = {};
      if (searchParams.priceRange.min) {
        priceQuery.$gte = searchParams.priceRange.min;
      }
      if (searchParams.priceRange.max) {
        priceQuery.$lte = searchParams.priceRange.max;
      }
      query["variants.price"] = priceQuery;
    }

    // Tìm kiếm theo màu sắc
    if (searchParams.color) {
      query["variants.color"] = new RegExp(searchParams.color, "i");
    }

    // Tìm kiếm theo size
    if (searchParams.size) {
      query["variants.size"] = new RegExp(searchParams.size, "i");
    }

    // Sắp xếp theo độ liên quan và rating
    sort = { averageRating: -1, salesCount: -1, createdAt: -1 };

    const products = await Product.find(query).populate("categoryId", "name").sort(sort).limit(limit);

    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

// Tạo response thông minh cho người dùng
async function generateResponse(userMessage, searchResults, searchParams) {
  try {
    const productSummary = searchResults
      .map((product) => ({
        name: product.name,
        brand: product.brand,
        category: product.categoryId?.name || "Không xác định",
        priceRange: {
          min: Math.min(...product.variants.map((v) => v.price)),
          max: Math.max(...product.variants.map((v) => v.price)),
        },
        rating: product.averageRating,
        available: product.variants.some((v) => v.stock > 0),
      }))
      .slice(0, 5); // Chỉ lấy 5 sản phẩm đầu

    const prompt = `
      Bạn là một AI sales assistant thân thiện và chuyên nghiệp của cửa hàng thời trang.
      
      Khách hàng vừa hỏi: "${userMessage}"
      
      Kết quả tìm kiếm (${searchResults.length} sản phẩm):
      ${JSON.stringify(productSummary, null, 2)}
      
      Hãy tạo một phản hồi thân thiện, hữu ích và chuyên nghiệp:
      1. Xác nhận hiểu được yêu cầu của khách
      2. Giới thiệu ngắn gọn các sản phẩm phù hợp
      3. Đưa ra gợi ý hoặc câu hỏi để hỗ trợ thêm
      4. Giữ giọng điệu thân thiện, không quá dài dòng
      5. Trả lời bằng tiếng Việt
      
      ${
        searchResults.length === 0
          ? "Lưu ý: Không tìm thấy sản phẩm phù hợp, hãy gợi ý khách tìm kiếm khác hoặc xem sản phẩm tương tự."
          : "Lưu ý: Có tìm thấy sản phẩm phù hợp, hãy giới thiệu và hướng dẫn khách xem chi tiết."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating response:", error);

    // Fallback response
    if (searchResults.length > 0) {
      return `Tôi đã tìm thấy ${searchResults.length} sản phẩm phù hợp với yêu cầu của bạn! Hãy xem danh sách bên dưới để tìm sản phẩm ưng ý nhé.`;
    } else {
      return `Xin lỗi, tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu "${userMessage}". Bạn có thể thử tìm kiếm với từ khóa khác hoặc xem các sản phẩm nổi bật của chúng tôi.`;
    }
  }
}

// Xử lý chat chính
async function processChat(userMessage) {
  try {
    // 1. Phân tích ý định người dùng
    const analysis = await analyzeUserIntent(userMessage);

    // 2. Tìm kiếm sản phẩm nếu là intent search_product
    let searchResults = [];
    if (analysis.intent === "search_product") {
      searchResults = await searchProducts(analysis.searchParams);
    }

    // 3. Tạo response thông minh
    const response = await generateResponse(userMessage, searchResults, analysis.searchParams);

    return {
      message: response,
      products: searchResults,
      analysis: analysis,
      success: true,
    };
  } catch (error) {
    console.error("Error processing chat:", error);
    return {
      message: "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
      products: [],
      analysis: null,
      success: false,
      error: error.message,
    };
  }
}

// Lấy gợi ý sản phẩm nổi bật
async function getFeaturedSuggestions() {
  try {
    const featuredProducts = await Product.find({ featured: true })
      .populate("categoryId", "name")
      .sort({ averageRating: -1, salesCount: -1 })
      .limit(6);

    const suggestions = [
      "Tìm áo sơ mi nam công sở",
      // "Váy dự tiệc nữ giá dưới 500k",
      // "Quần jean nam skinny",
      // "Áo khoác nữ mùa đông",
      // "Giày sneaker unisex",
      // "Phụ kiện thời trang trending",
    ];

    return {
      products: featuredProducts,
      suggestions: suggestions,
    };
  } catch (error) {
    console.error("Error getting featured suggestions:", error);
    return {
      products: [],
      suggestions: [],
    };
  }
}

module.exports = {
  analyzeUserIntent,
  searchProducts,
  generateResponse,
  processChat,
  getFeaturedSuggestions,
};
