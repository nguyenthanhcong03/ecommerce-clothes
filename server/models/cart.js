const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema cho các mục trong giỏ hàng (items)
const cartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product", // Tham chiếu tới model Product
    required: true,
  },
  variantId: {
    type: Schema.Types.ObjectId,
    required: true, // Không ref vì variantId là _id trong mảng variants của Product
  },
  quantity: {
    type: Number,
    required: true,
    min: 1, // Đảm bảo số lượng ít nhất là 1
  },
  selected: {
    type: Boolean,
    default: true, // Mặc định mục này được chọn để thanh toán
  },
  productName: {
    type: String,
    required: true, // Sao chép từ Product để hiển thị
  },
  variantAttributes: {
    type: Map,
    of: String, // Lưu các thuộc tính như size, color
  },
  priceWhenAdded: {
    type: Number,
    required: true, // Giá sản phẩm tại thời điểm thêm vào giỏ
  },
  imageUrl: {
    type: String, // URL ảnh của sản phẩm hoặc biến thể
  },
});

// Schema cho giỏ hàng (cart)
const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Tham chiếu tới model User
    required: true,
    unique: true, // Mỗi người dùng chỉ có một giỏ hàng
  },
  items: [cartItemSchema], // Mảng chứa các mục trong giỏ hàng
  createdAt: {
    type: Date,
    default: Date.now, // Thời gian tạo giỏ hàng
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Thời gian cập nhật giỏ hàng
  },
});

// Tạo model từ schema
const Cart = mongoose.model("Cart", cartSchema);

// Xuất model để sử dụng ở nơi khác
module.exports = Cart;
