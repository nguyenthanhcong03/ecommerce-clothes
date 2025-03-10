const userRoute = require("./userRoute");
const { notFound, errorHandler } = require("../middlewares/errHandler");
const initRoutes = (app) => {
  app.use("/api/user", userRoute);

  app.use(notFound);
  app.use(errorHandler);
};

module.exports = initRoutes;
