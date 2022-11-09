const { Schema, model } = require("mongoose");

const CurrencyListSchema = new Schema({
  currencyName: {
    type: String,
    required: true,
    dropDups: true,
  },
  currencyCode: {
    type: String,
    unique: true,
    dropDups: true,
  },
  description: {
    type: String,
  },
  exchangeRate: {
    type: Number,
  },
});

const User = model("currencies", CurrencyListSchema);

module.exports = User;
