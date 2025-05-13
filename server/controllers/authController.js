const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    await authService.registerUser(req.body);
    res.status(201).json({ success: true, message: "Vui lòng kiểm tra email để xác nhận tài khoản." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log("hi");

    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
    console.log("hi");
    // Lưu accessToken vào cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
    });

    // Lưu refreshToken vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: process.env.REFRESH_TOKEN_COOKIE_EXPIRES,
    });

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error.message === "Vui lòng xác thực email trước khi đăng nhập") {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.log("error", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    await authService.verifyUserEmail(token);
    res.status(200).json({ success: true, message: "Xác thực email thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUserById(req.user._id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

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

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(204).json({ success: true, message: "Đã đăng xuất rồi" });
    }

    // Xoá cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Không có token làm mới" });
  }

  try {
    const newAccessToken = await authService.refreshUserToken(refreshToken);

    // Lưu accessToken vào cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
    });

    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyEmail,
  changePassword,
  confirmForgotPassword,
  logout,
  refreshToken,
  getCurrentUser,
};
