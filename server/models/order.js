const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema(
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
      discountPrice: Number,
      color: String,
      size: String,
      image: String,
      // stock: Number,
    },
  },
  { _id: false } // Không cần _id cho mỗi item nếu không dùng đến
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: {
      type: [orderProductSchema],
      validate: [(arr) => arr.length > 0, "At least one product is required"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipping", "Delivered", "Cancelled"],
      default: "Processing",
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },
    payment: {
      method: {
        type: String,
        required: true,
        enum: ["COD", "Credit Card", "Momo", "VNPay"],
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
      paidAt: Date,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true, // Cho phép giá trị null hoặc không có
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
