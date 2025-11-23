const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
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
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      trim: true,
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    firstName: { type: String, required: [true, "Tên là bắt buộc"], trim: true },
    lastName: { type: String, required: [true, "Họ là bắt buộc"], trim: true },
    phone: {
      type: String,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Số điện thoại không hợp lệ"],
      required: [true, "Số điện thoại là bắt buộc"],
      trim: true,
    },
    avatar: { type: String, default: null, required: false },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
      required: false,
    },
    dateOfBirth: {
      type: String,
      required: false,
      default: null,
    },
    address: addressSchema,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
