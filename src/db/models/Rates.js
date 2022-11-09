const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  currencyName: {
    type: String,
    required: true,
  },
  currencyCode: {
    type: String,
  },
  exchangeRate: {
    type: Number,
  },
  date: {
    type: String,
  },
});

const User = mongoose.model("rates", UserSchema);

module.exports = User;
