import DataProvider from "./data-provider";
import { middlewares, logger } from "sc-common";
import mongoose from "mongoose";
import appConfigs from "./app-configs";
import CryptoExchanges from "./models/crypto-exchange";
import ContainerRegistry from "./container-registry";
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
