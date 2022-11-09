/* eslint-disable consistent-return */
const express = require("express");
const RatesModel = require("../../src/db/models/Rates");
const {
  successResponse,
  errorResponse,
} = require("../helpers/apiResponseHelper");

const router = express.Router();

// Sample URL: http://localhost:8080/fx-manager/rates/dollar?date=2013-01-23T18:30:00.000Z%22
router.get("/rates/dollar", async (req, res) => {
  // const { destCurrencyCode, fromDate, toDate } = req.params;

  const date = req.params.date || "2013-01-23T18:30:00.000Z";

  const payload = {
    date,
  };
  const dbResult = await RatesModel.find(payload);

  const mapresult = [];
  const errorMessages = [];

  dbResult.forEach((item) => {
    const errorMessage =
      item.exchangeRate === 0
        ? `Exchange Rate is not available on ${date}`
        : null;
    const obj = {
      currencyName: item.currencyName,
      currencyCode: item.currencyCode,
      valueInDollar: (1 / item.exchangeRate).toFixed(3),
    };
    mapresult.push(obj);
    if (errorMessage) {
      errorMessages.push(errorMessage);
    }
  });

  const apiResult = successResponse(mapresult, errorMessages);
  res.json(apiResult);
});

// GET  http://localhost:8080/fx-manager/rates?srcCurrencyCode=USD&destCurrencyCode=GBP&fromDate=2013-01-19T00:00:00.000+0000&toDate="2013-12-20T00:00:00.000+0000"

router.get("/rates", async (req, res) => {
  try {
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

    const result = {
      highest: {
        day: getHighDay,
        exchangeRate: getHighest,
      },
      lowest: {
        day: getLowDay,
        exchangeRate: getLowest,
      },
      exchangeRates: dbResult,
    };

    const apiResult = successResponse(result, []);
    res.json(apiResult);
  } catch (e) {
    next(errorResponse());
  }
});

module.exports = router;
