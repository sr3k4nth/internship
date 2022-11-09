/* eslint-disable consistent-return */
const express = require("express");
const RatesModel = require("../../src/db/models/Rates");
const {
  successResponse,
  errorResponse,
} = require("../helpers/apiResponseHelper");
const CurrencyModel = require("../../src/db/models/CurrencyList");

const router = express.Router();

// Sample URL: http://localhost:8080/fx-manager/rates/dollar?date=2013-01-23T18:30:00.000Z%22
router.get("/rates/dollar", async (req, res) => {
  const date = req.query?.date || 0;

  const mapresult = [];
  const errorMessages = [];

  const payload = {
    date,
  };
  const dbResult = await RatesModel.find(payload);

  dbResult.forEach((item) => {
    const errorMessage =
      item.exchangeRate === 0
        ? `Exchange Rate is not available on ${date}`
        : null;
    const obj = {
      currencyName: item.currencyName,
      currencyCode: item.currencyCode,
      valueInDollar: +(1 / +item.exchangeRate).toFixed(4),
    };
    mapresult.push(obj);
    if (errorMessage) {
      errorMessages.push(errorMessage);
    }
  });

  const apiResult = successResponse(mapresult, errorMessages);
  res.json(apiResult);
});

// GET  http://localhost:8080/fx-manager/rates?srcCurrencyCode=USD&destCurrencyCode=GBP&fromDate=2013-01-19T00:00:00.000+0000&toDate=2013-12-20T00:00:00.000+0000

router.get("/rates", async (req, res, next) => {
  try {
    const { destCurrencyCode, fromDate, toDate } = req.query;
    const errorMessages = [];
    const payload = {
      currencyCode: destCurrencyCode,
      date: {
        $gt: fromDate,
        $lt: toDate,
      },
    };
    const dbResult = await RatesModel.find(payload);

    const getHighest = Math.max(...dbResult.map((val) => val.exchangeRate));
    const getLowest = Math.min(...dbResult.map((val) => val.exchangeRate));

    const highDayObj = dbResult.find((key) => key.exchangeRate === getHighest);
    const getHighDay = highDayObj.day;
    const lowDayObj = dbResult.find((key) => key.exchangeRate === getLowest);
    const getLowDay = lowDayObj.day;

    dbResult.forEach((currency) => {
      if (currency.exchangeRate === 0) {
        const message = `Exchange Rate is not available on ${currency.date}`;
        errorMessages.push(message);
      }
    });

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

    const apiResult = successResponse(result, errorMessages);
    res.json(apiResult);
  } catch (e) {
    next(errorResponse());
  }
});

router.get("/currency-list", async (req, res, next) => {
  try {
    const dbResult = await CurrencyModel.find({});

    const apiResult = successResponse(dbResult, []);
    res.json(apiResult);
  } catch (e) {
    next(errorResponse());
  }
});

module.exports = router;
