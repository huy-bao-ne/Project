const accountRoute = require("./routes/account-route");

module.exports = function (app) {
  app.use("/", accountRoute);
};
