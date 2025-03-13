const jwt = require("jsonwebtoken");
const User = require("../models/user");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(403).json({ message: "Không có refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: "Người dùng không hợp lệ" });

    const newAccessToken = generateToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Refresh token không hợp lệ" });
  }
};

module.exports = { generateToken, generateRefreshToken, refreshToken };
