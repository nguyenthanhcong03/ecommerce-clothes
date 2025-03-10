const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, mobile, password } = req.body;
  if (!firstName || !lastName || !email || !mobile || !password) {
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

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  const response = await User.findOne({ email });
  if (response && (await response.isPasswordMatched(password))) {
    const { password, role, ...userData } = response.toObject();
    return res.status(200).json({
      success: true,
      userData,
    });
  } else {
    throw new Error("Invalid credential");
  }
});

module.exports = { register, login };
