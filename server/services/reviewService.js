import mongoose from "mongoose";
import Review from "../models/review.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import ApiError from "../utils/ApiError.js";

/**
 * ÄÃ¡nh giÃ¡ sáº£n pháº©m
 */
const createReview = async (reviewData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, productId, orderId } = reviewData;

    // Kiá»ƒm tra xem ngÆ°á»i dÃ¹ng Ä‘Ã£ mua sáº£n pháº©m nÃ y chÆ°a (thÃ´ng qua orderId)
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
      status: "Delivered",
      "products.productId": productId,
    }).session(session);

    if (!order) {
      throw new ApiError(400, "Báº¡n chÆ°a mua sáº£n pháº©m nÃ y hoáº·c Ä‘Æ¡n hÃ ng khÃ´ng há»£p lá»‡");
    }

    // Kiá»ƒm tra xem sáº£n pháº©m Ä‘Ã£ Ä‘Æ°á»£c Ä‘Ã¡nh giÃ¡ chÆ°a
    const productItem = order.products.find((item) => item.productId.toString() === productId && !item.isReviewed);

    if (!productItem) {
      throw new ApiError(400, "Sáº£n pháº©m nÃ y Ä‘Ã£ Ä‘Æ°á»£c Ä‘Ã¡nh giÃ¡ hoáº·c khÃ´ng cÃ³ trong Ä‘Æ¡n hÃ ng");
    }

    // Táº¡o review má»›i
    const review = await Review.create([reviewData], { session });

    // Cáº­p nháº­t tráº¡ng thÃ¡i isReviewed cho sáº£n pháº©m trong Ä‘Æ¡n hÃ ng
    await Order.updateOne(
      {
        _id: orderId,
        "products.productId": productId,
      },
      {
        $set: { "products.$.isReviewed": true },
      },
      { session }
    );

    // Cáº­p nháº­t thÃ´ng tin Ä‘Ã¡nh giÃ¡ trong sáº£n pháº©m
    await updateProductRatingStats(productId, session);

    await session.commitTransaction();
    session.endSession();

    return review[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Láº¥y táº¥t cáº£ Ä‘Ã¡nh giÃ¡ cá»§a má»™t sáº£n pháº©m
 */
const getProductReviews = async (productId, options) => {
  const query = { productId };

  if (options.rating) {
    query.rating = options.rating;
  }

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find(query)
    .sort(options.sort || "-createdAt")
    .skip(skip)
    .limit(limit)
    .populate(options.populate || "")
    .lean();

  return reviews;
};

/**
 * Láº¥y táº¥t cáº£ Ä‘Ã¡nh giÃ¡ cá»§a ngÆ°á»i dÃ¹ng hiá»‡n táº¡i
 */
const getUserReviews = async (userId, options) => {
  const query = { userId };

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find(query)
    .sort(options.sort || "-createdAt")
    .skip(skip)
    .limit(limit)
    .populate(options.populate || "")
    .lean();

  const total = await Review.countDocuments(query);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Pháº£n há»“i Ä‘Ã¡nh giÃ¡ (Admin)
 */
const replyToReview = async (reviewId, reply) => {
  // Validate reviewId
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "ID Ä‘Ã¡nh giÃ¡ khÃ´ng há»£p lá»‡");
  }

  const review = await Review.findByIdAndUpdate(reviewId, { reply }, { new: true }).populate(
    "userId",
    "firstName lastName avatar"
  );

  if (!review) {
    throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y Ä‘Ã¡nh giÃ¡");
  }

  return review;
};

/**
 * Cáº­p nháº­t thÃ´ng tin Ä‘Ã¡nh giÃ¡ trong sáº£n pháº©m
 */
const updateProductRatingStats = async (productId, session) => {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]).session(session);

  let averageRating = 0;
  let totalReviews = 0;

  if (stats.length > 0) {
    averageRating = Math.round(stats[0].averageRating * 10) / 10; // LÃ m trÃ²n Ä‘áº¿n 1 chá»¯ sá»‘ tháº­p phÃ¢n
    totalReviews = stats[0].totalReviews;
  }

  await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        averageRating,
        totalReviews,
      },
    },
    { session }
  );
};

/**
 * Láº¥y cÃ¡c sáº£n pháº©m cÃ³ thá»ƒ Ä‘Æ°á»£c Ä‘Ã¡nh giÃ¡ tá»« má»™t Ä‘Æ¡n hÃ ng Ä‘Ã£ giao.
 */
const getReviewableProducts = async (userId, orderId) => {
  // Find the order and check if it's valid and delivered
  const order = await Order.findOne({
    _id: orderId,
    userId,
    status: "Delivered",
  }).populate({
    path: "products.productId",
    select: "name images averageRating totalReviews",
  });

  if (!order) {
    throw new ApiError(404, "ÄÆ¡n hÃ ng khÃ´ng tá»“n táº¡i hoáº·c chÆ°a giao hÃ ng thÃ nh cÃ´ng");
  }

  // Lá»c cÃ¡c sáº£n pháº©m chÆ°a Ä‘Æ°á»£c Ä‘Ã¡nh giÃ¡.
  const reviewableProducts = order.products
    .filter((product) => !product.isReviewed)
    .map((product) => ({
      productId: product.productId._id,
      productInfo: {
        name: product.productId.name,
        image: product.snapshot.image,
        color: product.snapshot.color,
        size: product.snapshot.size,
        price: product.snapshot.price,
      },
      orderId: order._id,
      orderDate: order.createdAt,
      deliveredDate: order.statusUpdatedAt?.delivered || order.createdAt,
    }));

  return reviewableProducts;
};

/**
 * Get all reviews (Admin)
 */
const getAllReviews = async (options = {}) => {
  const reviews = await Review.find()
    .sort(options.sort)
    .populate(options.populate)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

  const total = await Review.countDocuments();

  return {
    reviews,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
    },
  };
};

export default { createReview, getProductReviews, getUserReviews, replyToReview, getReviewableProducts, getAllReviews };
