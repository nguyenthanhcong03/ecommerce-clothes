const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const connectDB = require("./config/dbconnect");
const initRoutes = require("./routes");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();
const port = process.env.PORT || 8888;

app.use(fileUpload());
app.use(
  cors({
    origin: "http://localhost:5173", // domain FE của bạn
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
initRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
