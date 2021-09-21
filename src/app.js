import DataProvider from "./data-provider";
import { middlewares, logger } from "sc-common";
import mongoose from "mongoose";
import appConfigs from "./app-configs";

const run = async () => {
  await middlewares.database.configureDatabase(mongoose, appConfigs.database);
  if (appConfigs.enabledLogs) {
    logger.start(appConfigs.sentry);
  }

  const dataProvider = new DataProvider();
  await dataProvider.init();
};

await run();
