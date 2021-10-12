import express from "express";
import http from "http";
import mongoose from "mongoose";
import { logger, middlewares } from "sc-common";

import appConfigs from "./app-configs";
import DataProvider from "./data-provider";
import ContainerRegistry from "./container-registry";
import exchangeSettings from "./exchange/exchange-settings";
import CryptoCandleSticks from "./models/crypto-candlestick";
import CryptoExchanges from "./models/crypto-exchange";

function initHttpServer() {
    const app = express();
    app.set("port", appConfigs.hostingPort);
    app.get("/", (req, res, next) => {
        res.send(`I'm Crypto Data Service!`);
    });

    const httpServer = http.createServer(app);
    httpServer.listen(app.get("port"), async () => {
        console.log(`Express server started and running on port ${app.get("port")}!`);
    });
}

async function initDataProvider() {
    const binanceExchange = new BinanceExchange(exchangeSettings.binance);
    const huobiExchange = new HuobiExchange(exchangeSettings.huobi);
    const mexcExchange = new MexcExchange(exchangeSettings.mexc);
    const okexExchange = new OkexExchange(exchangeSettings.okex);
  const container = new ContainerRegistry().register();

  const dataProvider = new DataProvider(container);
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
