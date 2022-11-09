const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { connect } = require("./src/db/mongoConnect");

const { notFound, errorHandler } = require("./src/middlewares");

const app = express();

require("dotenv").config();

app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());

(async function () {
  const uri = "mongodb://localhost:27017/local";

  const dbOptions = {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
    retryWrites: false,
  };
  await connect(uri, dbOptions);
  require("./src/db/models/Rates");
})();

const fxControllers = require("./src/routes/fxRoutes");

app.use("/fx-manager", fxControllers);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
