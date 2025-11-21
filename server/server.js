const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const connectDB = require("./config/dbconnect");
const initRoutes = require("./routes");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const { errorHandler } = require("./middlewares/errorHandler");
const { errorConverter } = require("./middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 8888;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(fileUpload());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Import và khởi động cron
require("./cron/cleanUnpaidOrders");

// Khởi tạo các routes
initRoutes(app);

// chuyển đổi lỗi sang ApiError nếu cần
app.use(errorConverter);
// xử lý lỗi
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
