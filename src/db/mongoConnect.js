// Imports
const mongoose = require("mongoose");
const logger = console;

module.exports = {
  connect: connect,
};

/**
 * Connect to a database
 * @param {*} connectionParams
 * @param {*} options
 */
async function connect(connection, options) {
  try {
    // Initialize
    let db, connectPromise;

    // Prepare connection
    mongoose.connect(encodeURI(connection), options);

    // Connect
    connectPromise = new Promise((resolve, reject) => {
      db = mongoose.connection;

      // Wait till connection is successful
      db.once("open", () => {
        logger.log("Database connection successful.");
        resolve();
      });

      db.on("reconnect", () => {
        console.log(":::::::::::Database reconnected:::::::::::::");
      });

      // Handle connection failure
      db.on("error", (error) => {
        logger.error("Database connection error :" + error);
        reject();
      });
    });
    await connectPromise;

    return Promise.resolve({
      code: 200,
      message: "Database connection successful.",
      data: db,
    });
  } catch (error) {
    if (error && error.code && error.message) {
      return Promise.reject({
        code: error.code,
        message: error.message,
        data: error.data,
      });
    } else {
      return Promise.reject({
        code: 409,
        message: "Error while establishing connection to database: " + error,
      });
    }
  }
}
