const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailService");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");

// Kiểm tra email đã tồn tại hay chưa
const checkEmailExists = async (email) => {
  const user = await User.findOne({ email });
  if (user) throw new ApiError(400, "Email đã được sử dụng");
  return email;
};

const registerUser = async (userData) => {
  const { password, email, phone, firstName, lastName } = userData;

  // Kiểm tra email đã tồn tại
  const existedEmail = await User.findOne({ email });
  if (existedEmail) throw new ApiError(400, "Email đã được sử dụng");

  // Kiểm tra phonenumber đã tồn tại
  const existedPhone = await User.findOne({ phone });
  if (existedPhone) throw new ApiError(400, "Số điện thoại đã được sử dụng");

  // Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Tạo người dùng mới
  const newUser = await User.create({
    email,
    phone,
    password: hashedPassword,
    firstName,
    lastName,
  });

  return newUser;
};

/**
 * Đăng nhập người dùng
 */
const loginUser = async (userData) => {
  const { email, password } = userData;

  // Tìm người dùng
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "Thông tin đăng nhập không hợp lệ");

  // Kiểm tra mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError("Thông tin đăng nhập không hợp lệ");

  // Kiểm tra trạng thái tài khoản
  if (user.isBlocked) {
    throw new ApiError(400, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
  }

  // Tạo tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const response = {
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      lastName: user.lastName,
      firstName: user.firstName,
    },
    accessToken,
    refreshToken,
  };

  return response;
};

/**
 * Xử lý quên mật khẩu
 */
const forgotUserPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Không tìm thấy email");
  }

  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // Hết hạn sau 1 giờ
  await user.save();

  // Gửi email reset
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Đặt lại mật khẩu</h1>
    <p>Nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
    <a href="${resetUrl}">Đặt lại mật khẩu</a>
    <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
  `;
  await sendEmail(email, "Yêu cầu đặt lại mật khẩu", html);

  return true;
};

/**
 * Xác nhận đặt lại mật khẩu
 */
const confirmResetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Token đặt lại không hợp lệ hoặc đã hết hạn");
  }

  // Mã hóa mật khẩu mới
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return true;
};

/**
 * Thay đổi mật khẩu
 */
const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  // Kiểm tra mật khẩu cũ
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Mật khẩu cũ không đúng");
  }
  console.log("đúng");

  // Mã hóa mật khẩu mới
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return true;
};

/**
 * Làm mới access token
 */
const refreshUserToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id);
  if (!user) throw new ApiError(404, "Người dùng không tồn tại");

  // Tạo access token mới
  const newAccessToken = generateAccessToken(user);
  return newAccessToken;
};

/**
 * Lấy thông tin người dùng hiện tại
 */
const getCurrentUserById = async (userId) => {
  const user = await User.findById(userId).select("-password -createdAt -updatedAt");
  if (!user) throw new ApiError(404, "Người dùng không tồn tại");
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  forgotUserPassword,
  confirmResetPassword,
  changeUserPassword,
  refreshUserToken,
  getCurrentUserById,
  checkEmailExists,
};
