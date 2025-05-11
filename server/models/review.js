const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    images: [
      {
        type: String, // Thường là URL ảnh
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0, // Có thể thêm nếu muốn người dùng "thích" review này
    },
    reply: {
      type: String,
      trim: true, // Admin/Shop có thể trả lời
    },
  },
  {
    timestamps: true,
  }
);

// Không cho phép cùng một user đánh giá 1 sản phẩm nhiều lần
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
