const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto-js");

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  ward: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
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
    },
    avatar: { type: String },
    gender: { enum: ["male", "female", "other"] },
    dateOfBirth: { type: String },
    address: [addressSchema],

    // Account status and roles
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isBlocked: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },

    // Preferences
    language: { type: String, enum: ["en", "vi"], default: "vi" },

    // Authentication and security
    verificationToken: { type: String },
    verificationStatus: { type: String, enum: ["pending", "verified"], default: "pending" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
