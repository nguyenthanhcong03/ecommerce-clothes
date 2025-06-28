const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const reviewService = require("../services/reviewService");

/**
 * Create a new review
 * @route POST /api/reviews
 */
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

/**
 * Get all reviews for a product
 * @route GET /api/reviews/product/:productId
 */
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

  const reviews = await reviewService.getProductReviews(productId, options);

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

/**
 * Get all reviews created by the current user
 * @route GET /api/reviews/user
 */
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

/**
 * Reply to a review (Admin only)
 * @route PATCH /api/reviews/:reviewId/reply
 */
const replyToReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;

  const review = await reviewService.replyToReview(reviewId, reply);

  res.status(200).json({
    success: true,
    data: review,
  });
});

/**
 * Get products that can be reviewed from a delivered order
 * @route GET /api/reviews/order/:orderId/reviewable
 */
const getReviewableProducts = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const reviewableProducts = await reviewService.getReviewableProducts(userId, orderId);

  res.status(200).json({
    success: true,
    data: reviewableProducts,
  });
});

/**
 * Get all reviews (Admin only)
 * @route GET /api/reviews/all
 */
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

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  getReviewableProducts,
  replyToReview,
  getAllReviews,
};
