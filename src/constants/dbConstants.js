const MONGOOSE_CONSTANTS = {
  URI: "mongodb://localhost:27017/local",
  OPTIONS: {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
    retryWrites: false,
  },
};

const MONGOOSE_EVENTS = {
  ERROR: "error",
  OPEN: "open",
};

module.exports = { MONGOOSE_CONSTANTS, MONGOOSE_EVENTS };
