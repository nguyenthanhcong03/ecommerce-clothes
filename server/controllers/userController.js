const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");
const jwt = require("jsonwebtoken");
const { createUserService } = require("../services/userService");

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  const user = await User.findOne({ email });
  if (user) {
    throw new Error("User already exists");
  } else {
    const newUser = await User.create(req.body);
    return res
      .status(200)
      .json({ success: newUser ? true : false, message: newUser ? "User created" : "User not created" });
  }
});

// const createUser = async (req, res) => {
//   const { firstName, lastName, email, phone, password } = req.body;
//   if (!firstName || !lastName || !email || !phone || !password) {
//     return res.status(400).json({ success: false, message: "Missing fields" });
//   }
//   const data = await createUserService(firstName, lastName, email, phone, password);
//   return res.status(200).json(data);
// };

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  const response = await User.findOne({ email });
  if (response && (await response.isPasswordMatched(password))) {
    // Tách password và role ra khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject();
    // Tạo accessToken
    const accessToken = generateAccessToken(response._id, role);
    // Tạo refreshToken
    const newRefreshToken = generateRefreshToken(response._id);
    // Lưu refreshToken vào db
    await User.findByIdAndUpdate(response._id, { newRefreshToken }, { new: true });
    // Lưu refreshToken vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      accessToken,
      userData,
    });
  } else {
    throw new Error("Invalid credential");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select("-password -refreshToken -role");
  return res.status(200).json({ success: true, rs: user ? user : "User not found" });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Lấy token từ cookies
  const cookie = req.cookies;
  // Check xem có token hay không
  if (!cookie && !cookie.refreshToken) {
    throw new Error("No Refresh token in cookies");
  }
  // Check token có hợp lệ hay không
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken });
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response ? generateAccessToken(response._id, response.role) : "Refresh token not sss",
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie && !cookie.refreshToken) {
    throw new Error("No Refresh token in cookies");
  }
  // Xóa refreshToken trong db
  await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: "" }, { new: true });
  // Xóa refreshToken trong cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) throw new Error("Missing fields");
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  const token = await user.createPasswordResetToken();
  await user.save();
  const html = `Nhấn vào liên kết dưới đây để thay đổi mật khẩu. Liên kết sẽ hết hạn sau 10 phút <a href=${process.env.SERVER_URL}/api/user/reset-password?token=${token}>Click here</a>`;
  const data = {
    to: email,
    html,
  };
  const rs = await sendMail(data);
  return res.status(200).json({ success: true, rs });
});

const getUsers = asyncHandler(async (req, res) => {
  const response = await User.find();
  return res.status(200).json({
    success: response ? true : false,
    users: response,
  });
});

module.exports = { logout, register, login, getCurrentUser, refreshAccessToken, forgotPassword, getUsers };
