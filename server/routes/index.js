const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const cartRoutes = require("./cartRoutes");
const fileRoutes = require("./fileRoutes");
const { notFound, errorHandler } = require("../middlewares/errHandler");

const initRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/file", fileRoutes);

  app.use(notFound);
  app.use(errorHandler);
};

module.exports = initRoutes;
