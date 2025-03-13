const userRoutes = require("./userRoutes");
const uploadFileRoutes = require("./uploadFileRoutes");
const customerRoutes = require("./customerRoutes");
const authRoutes = require("./authRoutes");
const { notFound, errorHandler } = require("../middlewares/errHandler");
const initRoutes = (app) => {
  app.use("/api/user", userRoutes);
  app.use("/api", uploadFileRoutes);
  app.use("/api/customers", customerRoutes);
  app.use("/api/auth", authRoutes);

  app.use(notFound);
  app.use(errorHandler);
};

module.exports = initRoutes;
