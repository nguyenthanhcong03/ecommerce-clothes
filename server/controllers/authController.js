const User = require("../models/user");
const crypto = require("crypto");
const { generateToken, generateRefreshToken } = require("../services/authService");
const { sendEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { username, password, role, email, phone, lastName, firstName } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists) return res.status(400).json({ message: "Người dùng đã tồn tại" });

  // Tạo token chứa thông tin người dùng
  // const token = jwt.sign({ username, password, role, email, phone, lastName, firstName }, process.env.JWT_SECRET, {
  //   expiresIn: "15m",
  // });

  const user = await User.create({ username, password, role, email, phone, lastName, firstName });

  // const verificationLink = `http://localhost:5000/api/auth/verify-email/${token}`;
  // await sendEmail(
  //   email,
  //   "Xác nhận tài khoản",
  //   `
  //     <h2>Chào mừng bạn đến với ứng dụng của chúng tôi!</h2>
  //     <p>Vui lòng nhấn vào liên kết dưới đây để xác nhận email:</p>
  //     <a href="${verificationLink}" target="_blank">Xác nhận email</a>
  // `
  // );

  res.status(201).json({
    message: "Vui lòng kiểm tra email để xác nhận tài khoản.",
  });

  //  // Kiểm tra email đã tồn tại chưa
  //  const existingUser = await User.findOne({ email });
  //  if (existingUser) {
  //      return res.status(400).json({ message: "Email đã được đăng ký." });
  //  }

  //  // Tạo token xác thực email
  //  const token = jwt.sign({ email, password, fullName }, process.env.EMAIL_SECRET, { expiresIn: '15m' });

  //  // Gửi email chứa liên kết xác nhận
  //  const confirmLink = `${process.env.CLIENT_URL}/confirm-email?token=${token}`;
  //  await sendEmail(email, "Xác nhận tài khoản của bạn", `
  //      <h1>Chào ${fullName}!</h1>
  //      <p>Vui lòng nhấn vào liên kết dưới đây để xác nhận tài khoản của bạn:</p>
  //      <a href="${confirmLink}">Xác nhận tài khoản</a>
  //      <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
  //  `);

  //  res.status(200).json({ message: "Vui lòng kiểm tra email để xác nhận tài khoản." });
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userExists = await User.findOne({ username: decoded.username });
    if (userExists) return res.status(400).json({ message: "Người dùng đã xác nhận trước đó." });

    // Tạo tài khoản sau khi xác nhận email
    const newUser = await User.create({
      username: decoded.username,
      password: decoded.password,
      role: decoded.role,
      email: decoded.email,
      phone: decoded.phone,
      lastName: decoded.lastName,
      firstName: decoded.firstName,
    });

    res.json({ message: "Xác nhận email thành công.", user: newUser });
  } catch (error) {
    res.status(400).json({ message: "Liên kết không hợp lệ hoặc đã hết hạn." });
  }
};

const login = async (req, res) => {
  const { username, password, role, email, phone, lastName, firstName } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
  console.log("hIH");
  res.json({
    _id: user._id,
    username: user.username,
    token: generateToken(user),
    refreshToken: generateRefreshToken(user),
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ username: email });
  if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetLink = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

  await sendEmail(
    email,
    "Yêu cầu đặt lại mật khẩu",
    `
      <h2>Đặt lại mật khẩu</h2>
      <p>Vui lòng nhấn vào liên kết dưới đây để đặt lại mật khẩu:</p>
      <a href="${resetLink}" target="_blank">Đặt lại mật khẩu</a>
  `
  );

  res.json({ message: "Vui lòng kiểm tra email để đặt lại mật khẩu." });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi khi đổi mật khẩu" });
  }
};

module.exports = { register, login, forgotPassword, verifyEmail, changePassword };
