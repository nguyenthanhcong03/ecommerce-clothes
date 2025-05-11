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
    gender: { enum: ["male", "female", "other", null] },
    dateOfBirth: { type: String },
    address: [addressSchema],

    // Account status and roles
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
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
