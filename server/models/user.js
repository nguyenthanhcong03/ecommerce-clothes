const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto-js");

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
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [6, "Password should be at least 6 characters long"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username should be at least 3 characters long"],
    },

    firstName: { type: String, required: [true, "First name is required"], trim: true },
    lastName: { type: String, required: [true, "Last name is required"], trim: true },
    phone: {
      type: String,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please enter a valid phone number"],
      required: [true, "Phone number is required"],
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

    // Account status and roles
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isBlocked: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
