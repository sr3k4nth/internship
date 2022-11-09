const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const mongoose = require("mongoose");
const RatesModel = require("./src/db/models/Rates");
const CurrencyModel = require("./src/db/models/CurrencyList");
const {
  MONGOOSE_CONSTANTS,
  MONGOOSE_EVENTS,
} = require("./src/constants/dbConstants");

mongoose.connect(MONGOOSE_CONSTANTS.URI, MONGOOSE_CONSTANTS.OPTIONS);
const db = mongoose.connection;
const uniq = [];
db.on(
  MONGOOSE_EVENTS.ERROR,
  console.error.bind(console, "::::::::::DB connection error::::::::::::: ")
);

db.once(MONGOOSE_EVENTS.OPEN, function () {
  console.log(
    "::::::::::::::::::::::::::::::::::::::::::::::::DB Connected successfully:::::::::::::::::::::::::::::::::::::::::::::::::"
  );
});

function getNames(s = "") {
  let currencyName = s.split("(")[0].trim();
  let currencyCode = s.split("(")[1].split(")")[0];
  return [currencyName, currencyCode];
}

async function dbInsert(arr) {
  try {
    const newRate = new RatesModel(arr);
    await newRate.save();
  } catch (e) {
    console.log(
      "::::::::::::::::::::::::::::::::::::::::::::::DB-ERROR::::::::::::::::::::::::::::::::::",
      e
    );
  }
}

async function currencyDBInsert(arr) {
  try {
    const Currency = new CurrencyModel(arr);
    await Currency.save();
  } catch (e) {
    console.log(
      "::::::::::::::::::::::::::::::::::::::::::::::DB-ERROR::::::::::::::::::::::::::::::::::",
      e
    );
  }
}

async function parseCSV(a, currencyInsert, isFirstRow) {
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

    if (currencyInsert) {
      const hasExists = uniq?.find(
        (item) => item.currencyCode === currencyCode
      );

      if (!hasExists && true) {
        const props = {
          currencyCode,
          currencyName,
          description: `The Currency Name is ${currencyName} and equivalent code is ${currencyCode}`,
          exchangeRate: obj.exchangeRate,
        };
        await currencyDBInsert(props);
      }
    }
    await dbInsert(obj);
    flag.push(obj);
  });

  return flag;
}

const readDataFromFile = (fileName) => {
  let currencyInsert = false;
  const LATEST_CSV_FILE = "2022.csv";

  if (fileName === LATEST_CSV_FILE) {
    currencyInsert = true;
  }
  fs.createReadStream(path.resolve(__dirname, "files", fileName))
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", async (row) => {
      await parseCSV(row, currencyInsert);
    })
    .on("end", async (rowCount) => {
      console.log(`------------Parsed ${rowCount} rows`);
    });
};
readDataFromFile(process.argv[2]);
