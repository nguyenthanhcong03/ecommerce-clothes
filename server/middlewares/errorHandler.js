const mongoose = require("mongoose"); // Nếu bạn dùng mongoose
const ApiError = require("../utils/ApiError"); // Giả sử bạn có một lớp ApiError để xử lý lỗi

const errorConverter = (err, req, res, next) => {
  let error = err;

  // Tạo object ánh xạ mã trạng thái HTTP
  const statusText = {
    400: "Bad Request",
    500: "Internal Server Error",
    // Có thể thêm các mã khác nếu cần
  };

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || statusText[statusCode] || "Unknown Error";

    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.log("ERROR LOG ", new Date().toLocaleString());
  console.log("Request:", req.method, req.originalUrl);
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("Query:", req.query);
  console.log("Error: ", err);
  console.log("Error stack: ", err.stack);
  console.log("--------------------------------------------------------------------------------------");
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    errors: err.errors || null,
    stack: err.stack,
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = {
  errorConverter,
  errorHandler,
};
