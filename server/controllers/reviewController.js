import reviewService from "../services/reviewService.js";
import catchAsync from "../utils/catchAsync.js";

// Táº¡o má»›i Ä‘Ã¡nh giÃ¡ sáº£n pháº©m
const createReview = catchAsync(async (req, res) => {
  const { productId, orderId, rating, comment } = req.body;
  const userId = req.user._id;

  const review = await reviewService.createReview({
    userId,
    productId,
    orderId,
    rating,
    comment: comment || "",
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

// Láº¥y Ä‘Ã¡nh giÃ¡ cá»§a sáº£n pháº©m
const getProductReviews = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { rating, page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const options = {
    rating: rating ? parseInt(rating, 10) : undefined,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: {
      path: "userId",
      select: "firstName lastName avatar",
    },
  };

  const response = await reviewService.getProductReviews(productId, options);
  res.status(200).json({
    success: true,
    data: {
      data: response,
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    },
    message: "Láº¥y Ä‘Ã¡nh giÃ¡ sáº£n pháº©m thÃ nh cÃ´ng",
  });
});

// Láº¥y Ä‘Ã¡nh giÃ¡ cá»§a ngÆ°á»i dÃ¹ng
const getUserReviews = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: "-createdAt",
    populate: {
      path: "productId",
      select: "name images",
    },
  };

  const reviews = await reviewService.getUserReviews(userId, options);

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// Tráº£ lá»i Ä‘Ã¡nh giÃ¡ (admin)
const replyToReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;

  const review = await reviewService.replyToReview(reviewId, reply);

  res.status(200).json({
    success: true,
    data: review,
  });
});

// Láº¥y danh sÃ¡ch sáº£n pháº©m cÃ³ thá»ƒ Ä‘Ã¡nh giÃ¡
const getReviewableProducts = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const reviewableProducts = await reviewService.getReviewableProducts(userId, orderId);

  res.status(200).json({
    success: true,
    data: reviewableProducts,
  });
});

// Láº¥y táº¥t cáº£ Ä‘Ã¡nh giÃ¡ (admin)
const getAllReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: {
      path: "userId",
      select: "firstName lastName avatar",
    },
  };

  const reviews = await reviewService.getAllReviews(options);

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

export default {
  createReview,
  getProductReviews,
  getUserReviews,
  getReviewableProducts,
  replyToReview,
  getAllReviews,
};
