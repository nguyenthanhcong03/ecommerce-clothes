const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/dbconnect");
const initRoutes = require("./routes");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();
const port = process.env.PORT || 8888;

app.use(fileUpload());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
initRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
