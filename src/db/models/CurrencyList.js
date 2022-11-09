const { Schema, model } = require("mongoose");

const CurrencyListSchema = new Schema({
  currencyName: {
    type: String,
    required: true,
  },
  currencyCode: {
    type: String,
  },
  description: {
    type: String,
  },
});

const User = model("currency-list", CurrencyListSchema);

module.exports = User;
