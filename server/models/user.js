const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto-js");

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ["home", "work", "billing", "shipping"], required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const preferencesSchema = new mongoose.Schema({
  language: { type: String, default: "en" },
  currency: { type: String, default: "USD" },
  notifications: { type: Boolean, default: true },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trum: true, unique: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, unique: true },
    address: [addressSchema],
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
    lastLogin: { type: Date, default: Date.now },
    preferences: preferencesSchema,
    verificationToken: { type: String }, // Token xác thực email
    verificationStatus: { type: String, enum: ["pending", "verified"], default: "pending" },
    resetPasswordToken: { type: String }, // Token reset password
    resetPasswordExpires: { type: Date }, // Thời gian hết hạn token reset
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

// // Mã hóa mật khẩu trước khi lưu
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // So sánh mật khẩu
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model("User", userSchema);
