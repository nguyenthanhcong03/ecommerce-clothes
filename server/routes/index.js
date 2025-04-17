const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const uploadFileRoutes = require("./uploadFileRoutes");
const customerRoutes = require("./customerRoutes");
const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const cartRoutes = require("./cartRoutes");
const { notFound, errorHandler } = require("../middlewares/errHandler");
const initRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  // app.use("/api", uploadFileRoutes);
  // app.use("/api/customers", customerRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/cart", cartRoutes);

  app.use(notFound);
  app.use(errorHandler);
};

module.exports = initRoutes;
