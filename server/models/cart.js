const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Trỏ đến một variant cụ thể trong mảng variants của sản phẩm
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    snapshot: {
      name: String,
      price: Number,
      originalPrice: Number,
      color: String,
      size: String,
      image: String,
      stock: Number,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh cart theo user hoặc session
cartSchema.index({ userId: 1 }, { unique: true });
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
