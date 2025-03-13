const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto-js");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlenght: 6,
    },
    role: {
      type: String,
      default: "user",
    },
    cart: {
      type: Array,
      default: [],
    },
    address: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Address",
      },
    ],
    wishlist: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],
    isBloocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: String },
  },
  {
    timestamps: true,
  }
);

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// So sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// userSchema.methods = {
//   isPasswordMatched: async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
//   },
//   createPasswordResetToken: function () {
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     this.passwordChangedAt = Date.now();
//     this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//     this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
//     return resetToken;
//   },
// };

module.exports = mongoose.model("User", userSchema);
