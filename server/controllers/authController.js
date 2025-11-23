const authService = require("../services/authService");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { responseSuccess } = require("../utils/responseHandler");

const register = catchAsync(async (req, res) => {
  const { password, email, phone, firstName, lastName } = req.body;
  if (!password || !email || !phone || !firstName || !lastName) {
    throw new ApiError(400, "Vui lòng điền đầy đủ thông tin bắt buộc");
  }

  const response = await authService.registerUser({
    password,
    email,
    phone,
    firstName,
    lastName,
  });
  responseSuccess(res, 201, "Đăng ký tài khoản thành công", response);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Vui lòng điền đầy đủ thông tin đăng nhập");

  const response = await authService.loginUser({ email, password });
  // Lưu accessToken vào cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true,
    // sameSite: "Strict",
    maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
  });

  // Lưu refreshToken vào cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: true,
    // sameSite: "Strict",
    maxAge: process.env.REFRESH_TOKEN_COOKIE_EXPIRES,
  });

  responseSuccess(res, 200, "Đăng nhập thành công", {
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
});

const getCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await authService.getCurrentUserById(userId);
  return responseSuccess(res, 200, "Lấy thông tin người dùng thành công", user);
});

const forgotPassword = async (req, res) => {
  try {
    await authService.forgotUserPassword(req.body.email);
    res.status(200).json({ success: true, message: "Đã gửi liên kết đặt lại mật khẩu đến email của bạn" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const confirmForgotPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    await authService.confirmResetPassword(token, newPassword);
    res.status(200).json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    await authService.changeUserPassword(req.user._id, oldPassword, newPassword);
    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    if (error.message === "Mật khẩu cũ không đúng") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return responseSuccess(res, 200, "Đã đăng xuất thành công");
  // Xoá cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
  });
  responseSuccess(res, 200, "Đăng xuất thành công");
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new ApiError(401, "Không tìm thấy refresh token");

  const newAccessToken = await authService.refreshUserToken(refreshToken);
  // Lưu accessToken vào cookie
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
    // sameSite: "Strict", // Quan trọng nếu frontend/backend khác domain
    // secure: true, // Bắt buộc nếu dùng sameSite: "None"
  });

  responseSuccess(res, 200, "Làm mới token thành công", newAccessToken);
});

/**
 * Kiểm tra email đã tồn tại hay chưa
 */
const checkEmailExists = catchAsync(async (req, res) => {
  const { email } = req.params;
  const exists = await authService.checkEmailExists(email);

  responseSuccess(res, 200, "Kiểm tra email thành công");
});

module.exports = {
  register,
  login,
  forgotPassword,
  changePassword,
  confirmForgotPassword,
  logout,
  refreshToken,
  getCurrentUser,
  checkEmailExists,
};
