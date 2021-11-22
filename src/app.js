import express from "express";
import http from "http";
import mongoose from "mongoose";
import { logger, middlewares } from "sc-common";

import appConfigs from "./app-configs";
import ContainerRegistry from "./container-registry";
import exchangeSettings from "./exchange/exchange-settings";

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
    const container = new ContainerRegistry().register(exchangeSettings);

    const dataProvider = container.resolve("dataProvider");
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
