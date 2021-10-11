import DataProvider from "./data-provider";
import { middlewares, logger } from "sc-common";
import mongoose from "mongoose";
import appConfigs from "./app-configs";
import CryptoExchanges from "./models/crypto-exchange";
import BinanceExchange from "./exchange/binance-exchange";
import HuobiExchange from "./exchange/huobi-exchange";
import MexcExchange from "./exchange/mexc-exchange";
import OkexExchange from "./exchange/okex-exchange";
import express from "express";
import http from "http";
import CryptoCandleSticks from "./models/crypto-candlestick";

function initHttpServer() {
  const app = express();
  app.set("port", appConfigs.hostingPort);
  app.get("/", (req, res, next) => {
    res.send(`I'm Crypto Data Service!`);
  });

  const httpServer = http.createServer(app);
  httpServer.listen(app.get("port"), async () => {
    console.log(
      `Express server started and running on port ${app.get("port")}!`
    );
  });
}

async function initDataProvider() {
  const binanceExchange = new BinanceExchange(
    "https://api.binance.com/api/v3/klines?interval=1m&symbol=BTCUSDT&limit=60",
    "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
  );

  const huobiExchange = new HuobiExchange(
    "https://api.huobi.pro/market/history/kline?symbol=btcusdt&period=1min&size=60",
    "wss://api.huobi.pro/ws"
  );

  const mexcExchange = new MexcExchange(
    "https://www.mexc.com/open/api/v2/market/kline?symbol=BTC_USDT&interval=1m&limit=60",
    "wss://contract.mexc.com/ws"
  );

  const okexExchange = new OkexExchange(
    "https://www.okex.com/api/v5/market/candles?limit=60&bar=1m&instId=BTC-USDT",
    "wss://ws.okex.com:8443/ws/v5/public"
  );
  const dataProvider = new DataProvider(
    {
      binanceExchange,
      huobiExchange,
      mexcExchange,
      okexExchange,
    },
    CryptoExchanges,
    CryptoCandleSticks
  );
  await dataProvider.init();
}

const run = async () => {
  initHttpServer();
  await middlewares.database.configureDatabase(mongoose, appConfigs.database);
  if (appConfigs.enabledLogs) {
    logger.start(appConfigs.sentry);
  }

  await initDataProvider();
};

await run();
