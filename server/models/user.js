const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto-js");

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ["home", "work", "billing", "shipping"], required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const preferencesSchema = new mongoose.Schema({
  language: { type: String, default: "en" },
  currency: { type: String, default: "USD" },
  notifications: { type: Boolean, default: true },
});

const userSchema = new mongoose.Schema(
  {
    // Account information
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

    // Personal information
    firstName: { type: String, required: [true, "First name is required"], trim: true },
    lastName: { type: String, required: [true, "Last name is required"], trim: true },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please enter a valid phone number"],
    },
    avatar: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    address: [addressSchema],

    // Account status and roles
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
    lastLogin: { type: Date, default: Date.now },

    // Preferences and features
    preferences: preferencesSchema,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Authentication and security
    verificationToken: { type: String },
    verificationStatus: { type: String, enum: ["pending", "verified"], default: "pending" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// // Mã hóa mật khẩu trước khi lưu
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // So sánh mật khẩu
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // Generate password reset token
// userSchema.methods.generatePasswordResetToken = function () {
//   const resetToken = crypto.lib.WordArray.random(20).toString();

//   this.resetPasswordToken = crypto.SHA256(resetToken).toString();
//   this.resetPasswordExpires = Date.now() + 3600000; // 1 hour

//   return resetToken;
// };

// // Generate email verification token
// userSchema.methods.generateVerificationToken = function () {
//   const verificationToken = crypto.lib.WordArray.random(20).toString();

//   this.verificationToken = crypto.SHA256(verificationToken).toString();

//   return verificationToken;
// };

module.exports = mongoose.model("User", userSchema);
