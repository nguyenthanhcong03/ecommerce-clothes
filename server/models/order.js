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
      originalPrice: Number,
      color: String,
      size: String,
      image: String,
    },
    isReviewed: {
      type: Boolean,
      default: false,
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
      enum: ["Unpaid", "Pending", "Processing", "Shipping", "Delivered", "Cancelled"],
      default: "Pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      email: { type: String, required: true },
      street: { type: String, required: true },
      ward: {
        code: { type: String, required: true }, // Mã phường/xã
        name: { type: String, required: true }, // Tên phường/xã
      },
      district: {
        code: { type: String, required: true }, // Mã quận/huyện
        name: { type: String, required: true }, // Tên quận/huyện
      },
      province: {
        code: { type: String, required: true }, // Mã tỉnh/thành phố
        name: { type: String, required: true }, // Tên tỉnh/thành phố
      },
      note: { type: String },
    },
    payment: {
      method: {
        type: String,
        required: true,
        enum: ["COD", "Momo", "VNPay"],
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
    cancelReason: {
      type: String,
      maxlength: 1000,
    },
    cancelTime: {
      type: Date,
    },
    // Lưu trữ thời gian cập nhật trạng thái đơn hàng
    statusUpdates: {
      processing: {
        type: Date,
        default: Date.now,
      },
      shipping: {
        type: Date,
      },
      delivered: {
        type: Date,
      },
      cancelled: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

// Middleware để cập nhật thời gian khi trạng thái đơn hàng thay đổi
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const status = this.status.toLowerCase();
    if (this.statusUpdates && status in this.statusUpdates) {
      this.statusUpdates[status] = Date.now();
    }
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
