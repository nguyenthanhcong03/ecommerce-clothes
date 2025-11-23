import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

const errorConverter = (err, req, res, next) => {
  let error = err;

  // Táº¡o object Ã¡nh xáº¡ mÃ£ tráº¡ng thÃ¡i HTTP
  const statusText = {
    400: "Bad Request",
    500: "Internal Server Error",
    // CÃ³ thá»ƒ thÃªm cÃ¡c mÃ£ khÃ¡c náº¿u cáº§n
  };

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || statusText[statusCode] || "Unknown Error";

    error = new ApiError(statusCode, message, null, false, err.stack);
  }

  next(error);
};

const errorHandler = (err, req, res, next) => {
  // console.log("ERROR LOG ", new Date().toLocaleString());
  // console.log("Request:", req.method, req.originalUrl);
  // console.log("Params:", req.params);
  // console.log("Body:", req.body);
  // console.log("Query:", req.query);
  // console.log("Error: ", err);
  // console.log("Error stack: ", err.stack);
  // console.log("--------------------------------------------------------------------------------------");
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal server error",
    errors: err.errors || null,
    stack: err.stack,
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorConverter, errorHandler };

