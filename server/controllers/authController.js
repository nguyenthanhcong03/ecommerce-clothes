const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { username, password, email, phone, firstName, lastName } = req.body;
    console.log("req.body", req.body);
    if (!username || !password || !email || !phone || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Tất cả các trường là bắt buộc",
      });
    }

    await authService.registerUser({
      username,
      password,
      email,
      phone,
      firstName,
      lastName,
    });
    res.status(201).json({ success: true, message: "Đăng ký tài khoản thành công" });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const cookie = req.cookies;
  console.log("🚀 ~ authController.js:31 ~ login ~ cookie:", cookie);

  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
    // Lưu accessToken vào cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: "Strict",
      // maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
    });

    // Lưu refreshToken vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: "Strict",
      // maxAge: process.env.REFRESH_TOKEN_COOKIE_EXPIRES,
    });

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
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
    // console.log("newAccessToken", newAccessToken);
    // Lưu accessToken vào cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      // maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
      // sameSite: "Strict", // Quan trọng nếu frontend/backend khác domain
      // secure: true, // Bắt buộc nếu dùng sameSite: "None"
    });

    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(401).json({ success: false, message: error.message });
  }
};

/**
 * Kiểm tra username đã tồn tại hay chưa
 */
const checkUsernameExists = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username là bắt buộc",
      });
    }
    const exists = await authService.checkUsernameExists(username);

    res.status(200).json({
      success: true,
      exists,
      message: exists ? "Username đã tồn tại" : "Username có thể sử dụng",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra username",
    });
  }
};

/**
 * Kiểm tra email đã tồn tại hay chưa
 */
const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc",
      });
    }

    // Kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng email không hợp lệ",
      });
    }

    const exists = await authService.checkEmailExists(email);

    res.status(200).json({
      success: true,
      exists,
      message: exists ? "Email đã tồn tại" : "Email có thể sử dụng",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra email",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  changePassword,
  confirmForgotPassword,
  logout,
  refreshToken,
  getCurrentUser,
  checkUsernameExists,
  checkEmailExists,
};
