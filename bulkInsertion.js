const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const mongoose = require("mongoose");
const User = require("./models");
mongoose.connect("mongodb://localhost:27017/local", {
  useNewUrlParser: true,
  // useFindAndModify: false,
  useUnifiedTopology: true,
  retryWrites: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

function getNames(s = "") {
  let currencyName = s.split("(")[0].trim();
  let currencyCode = s.split("(")[1].split(")")[0];
  return [currencyName, currencyCode];
}

async function dbInsert(arr) {
  try {
    const newRate = new User(arr);
    const res = await newRate.save();
    console.log(res, "========================================");
  } catch (e) {
    console.log(e);
  }
}

async function parseCurrency(a) {
  const date = new Date(a.Date).toISOString();

  delete a.Date;

  const flag = [];

  Object.keys(a).forEach(async (key, i) => {
    const obj = {};

    obj.date = date;
    const currency = key.trim().replace(/\s/g, " ");
    const [currencyName, currencyCode] = getNames(currency);
    obj.currencyName = currencyName;
    obj.currencyCode = currencyCode;
    obj.exchangeRate = +a[key];
    await dbInsert(obj);
    flag.push(obj);
  });

  return flag;
}

fs.createReadStream(
  path.resolve(__dirname, "files", "Exchange_Rate_Report_2013.csv")
)
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", async (row) => {
    const data = await parseCurrency(row);
    console.log(data);
    console.log("----------------------------------------------");
  })
  .on("end", (rowCount) => console.log(`Parsed ${rowCount} rows`));
