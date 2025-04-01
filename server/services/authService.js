const jwt = require("jsonwebtoken");
const User = require("../models/user");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

module.exports = { generateToken, generateRefreshToken };
