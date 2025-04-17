const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  // // Nếu gửi kèm header theo lưu trong local storage
  // let token = req.headers.authorization?.split(" ")[1];

  // Lấy token trong cookie
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ message: "Không có access token, từ chối truy cập" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
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

const checkRole = (...allowedRoles) => {
  console.log("hih1");

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }
    const hasRole = allowedRoles.includes(req.user.role);
    if (req.user.role !== role) {
      return res.status(403).json({ succes: false, message: "Access denied" });
    }
    next();
  };
};

module.exports = { verifyToken, admin, checkRole };
