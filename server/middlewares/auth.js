const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Không có token, từ chối truy cập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = await User.findById(decoded._id).select("-password");
    req.user = decoded; // Lưu thông tin user vào request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Access token expired", expired: true });
    }
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Bạn không có quyền truy cập" });
  }
};

const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ succes: false, message: "Access denied" });
    }
    next();
  };
};

module.exports = { protect, admin, checkRole };
