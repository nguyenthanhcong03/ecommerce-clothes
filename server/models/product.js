const mongoose = require("mongoose"); // Erase if already required

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    quantity: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    color: {
      type: String,
      enum: ["Black", "Green", "White"],
    },
    size: {
      type: String,
      enum: ["S", "M", "L"],
    },
    ratings: [
      {
        star: {
          type: Number,
          postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
          comment: { type: String },
        },
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 1. Index cho tìm kiếm văn bản (text search)
productSchema.index({ name: "text", description: "text" });
// Hỗ trợ truy vấn $regex trong API khi search theo tên hoặc mô tả

// 2. Index cho field variants.price
productSchema.index({ "variants.price": 1 });
// Hỗ trợ filter theo giá (minPrice, maxPrice)

// 3. Index cho categoryId
productSchema.index({ categoryId: 1 });
// Hỗ trợ filter theo danh mục

// 4. Index cho brand
productSchema.index({ brand: 1 });
// Hỗ trợ filter theo thương hiệu

// 5. Index compound (kết hợp nhiều field)
productSchema.index({ isActive: 1, createdAt: -1 });
// Hỗ trợ sort theo createdAt và filter isActive cùng lúc

module.exports = mongoose.model("Product", productSchema);
