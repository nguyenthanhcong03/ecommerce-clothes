const express = require("express");
require("dotenv").config();
const connectDB = require("./config/dbconnect");
const initRoutes = require("./routes");

const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
initRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
