const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateToken, generateRefreshToken } = require("../services/authService");
const { sendEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { username, password, role, email, phone, lastName, firstName } = req.body;

  try {
    // Kiểm tra email đã tồn tại
    const existedUser = await User.findOne({ username });
    if (existedUser) {
      return res.status(400).json({ message: "Người dùng đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      verificationToken,
    });

    // Gửi email xác thực
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const html = `
      <h1>Welcome, ${firstName} ${lastName}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;
    await sendEmail(email, "Verify Your Email", html);

    res.status(201).json({ success: true, message: "Vui lòng kiểm tra email để xác nhận tài khoản." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// const verifyEmail1 = async (req, res) => {
//   const { token } = req.query;
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const userExists = await User.findOne({ username: decoded.username });
//     if (userExists) return res.status(400).json({ message: "Người dùng đã xác nhận trước đó." });

//     // Tạo tài khoản sau khi xác nhận email
//     const newUser = await User.create({
//       username: decoded.username,
//       password: decoded.password,
//       role: decoded.role,
//       email: decoded.email,
//       phone: decoded.phone,
//       lastName: decoded.lastName,
//       firstName: decoded.firstName,
//     });

//     res.json({ message: "Xác nhận email thành công.", user: newUser });
//   } catch (error) {
//     res.status(400).json({ message: "Liên kết không hợp lệ hoặc đã hết hạn." });
//   }
// };

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    user.verificationStatus = "verified";
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// const login = async (req, res) => {
//   const { username, password } = req.body;

//   const user = await User.findOne({ username });
//   if (!user || !(await user.matchPassword(password)))
//     return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
//   console.log("hIH");
//   res.json({
//     _id: user._id,
//     username: user.username,
//     token: generateToken(user),
//     refreshToken: generateRefreshToken(user),
//   });
// };

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // // Kiểm tra email đã xác thực chưa
    // if (user.verificationStatus !== "verified") {
    //   return res.status(403).json({ success: false, message: "Please verify your email first" });
    // }

    // Tạo access token
    const accessPayload = { userId: user._id, role: user.role };
    const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Tạo refresh token
    const refreshPayload = { userId: user._id };
    const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Lưu refresh token vào database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ username: email });
//   if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

//   const resetToken = crypto.randomBytes(32).toString("hex");
//   const resetLink = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

//   await sendEmail(
//     email,
//     "Yêu cầu đặt lại mật khẩu",
//     `
//       <h2>Đặt lại mật khẩu</h2>
//       <p>Vui lòng nhấn vào liên kết dưới đây để đặt lại mật khẩu:</p>
//       <a href="${resetLink}" target="_blank">Đặt lại mật khẩu</a>
//   `
//   );

//   res.json({ message: "Vui lòng kiểm tra email để đặt lại mật khẩu." });
// };

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Hết hạn sau 1 giờ
    await user.save();

    // Gửi email reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;
    await sendEmail(email, "Password Reset Request", html);

    res.status(200).json({ success: true, message: "Reset password link sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Xac nhan reset password
const confirmForgotPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mật khẩu cũ không đúng" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi đổi mật khẩu" });
  }
};

// Đăng xuất (Logout) - Xóa refresh token
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token provided" });
  }

  try {
    // Xác minh refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
    // // Tạo access token mới
    // const accessPayload = { userId: user._id, role: user.role };
    // const newAccessToken = jwt.sign(accessPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Tạo access token mới
    const newAccessToken = generateToken(user);
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Refresh token expired" });
    }
    res.status(401).json({ success: false, message: "Invalid refresh token" });
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
};
