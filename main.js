const app = require("express")();

const mongoose = require("mongoose");
const RatesModel = require("./models");
mongoose.connect("mongodb://localhost:27017/local", {
  useNewUrlParser: true,
  // useFindAndModify: false,
  useUnifiedTopology: true,
  retryWrites: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "db connection error"));
db.once("open", function () {
  console.log("Connected successfully");
});

app.get("/test", (req, res) => {
  console.log("hello");
  res.json({ name: "hello world!" });
});

// GET /exchange-rates?srcCurrencyCode="DOLLAR"&destCurrencyCode="pound"&fromDate="2013-01-19T00:00:00.000+0000"&toDate=""

app.get("/fx-rates", async (req, res) => {
  const { destCurrencyCode, fromDate, toDate } = req.params;
  const payload = {
    currencyCode: destCurrencyCode || "DKK",
    date: {
      $gt: fromDate || "2013-01-19T00:00:00.000+0000",
      $lt: toDate || "2013-12-20T00:00:00.000+0000",
    },
  };
  const dbResult = await RatesModel.find(payload);

  const getHighest = Math.max(...dbResult.map((val) => val.exchangeRate));
  const getLowest = Math.min(...dbResult.map((val) => val.exchangeRate));

  const highDayObj = dbResult.find((key) => key.exchangeRate === getHighest);
  const getHighDay = highDayObj.day;
  const lowDayObj = dbResult.find((key) => key.exchangeRate === getLowest);
  const getLowDay = lowDayObj.day;

  const apiResult = {
    status: "success",
    data: {
      highest: {
        day: getHighDay,
        exchangeRate: getHighest,
      },
      lowest: {
        day: getLowDay,
        exchangeRate: getLowest,
      },
      exchangeRates: dbResult,
    },
    errorMessages: [],
  };
  console.log(dbResult);

  res.json(apiResult);
});

// {"currencyCode": "DKK",  date: "2013-01-23T18:30:00.000Z" }

app.get("/fx-rates/dollar", async (req, res) => {
  // const { destCurrencyCode, fromDate, toDate } = req.params;

  const date = req.params.date || "2013-01-23T18:30:00.000Z";

  const payload = {
    date,
  };
  const dbResult = await RatesModel.find(payload);

  const mapresult = [];

  dbResult.forEach((item) => {
    const obj = {
      currencyName: item.currencyName,
      currencyCode: item.currencyCode,
      valueInDollar: (1 / item.exchangeRate).toFixed(3),
    };
    mapresult.push(obj);
  });

  const apiResult = {
    status: "success",
    data: mapresult,
    errorMessages: [],
  };
  console.log(dbResult);

  res.json(apiResult);
});

app.listen(8080, () => console.log("connected to server on 8080"));
