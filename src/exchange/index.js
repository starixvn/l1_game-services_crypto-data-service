import axios from "axios";
import HttpsProxyAgent from "https-proxy-agent";
import { logger } from "sc-common";
import WebSocket from "ws";
import appConfigs from "../app-configs";

export default class Exchange {
  runningCandleStick;
  candleSticks;
  ws;

  constructor(settings) {
    this.settings = settings;
    this.configName = settings.name.toLowerCase();
    this.candleSticks = [];

    this.handleMessage = this.handleMessage.bind(this);
    this.handleWSError = this.handleWSError.bind(this);
    this.handleCloseWS = this.handleCloseWS.bind(this);

    if (appConfigs.proxy) {
      this.proxyAgent = new HttpsProxyAgent(appConfigs.proxy[this.configName]);
    }
  }

  async getLatestCandleSticks(currentCandleSticks) {
    try {
      const axiosOptions = {};

      if (this.proxyAgent) {
        axiosOptions.httpsAgent = this.proxyAgent;
      }

      const responseData = await axios.get(this.settings.api, axiosOptions);
      this.candleSticks = this.mapRestApiDataToCandleSticks(responseData.data);
    } catch (exception) {
      logger.logError(exception);
    } finally {
      this.mergeWithCurrentCandleSticks(currentCandleSticks);
      this.runningCandleStick = this.candleSticks[this.candleSticks.length - 1];
    }

    return this.candleSticks;
  }

  mergeWithCurrentCandleSticks(currentCandleSticks) {
    if (this.candleSticks.length > 0) {
      for (let i = 0; i < this.candleSticks.length; i++) {
        const currentCandleStick = currentCandleSticks.find(
          (x) => x.time.getTime() === this.candleSticks[i].time.getTime()
        );

        if (currentCandleStick) {
          this.candleSticks[i] = currentCandleStick[this.configName];
        }
      }
    } else {
      const to = new Date();
      to.setSeconds(0, 0);
      const from = new Date(to);
      from.setMinutes(from.getMinutes() - 59);

      this.candleSticks = currentCandleSticks
        .filter(
          (x) =>
            x.time.getTime() >= from.getTime() &&
            x.time.getTime() <= to.getTime()
        )
        .map((x) => x[this.configName]);

      if (this.candleSticks.length === 0) {
        this.candleSticks = currentCandleSticks
          .slice(-1)
          .map((x) => x[this.configName]);
      }

      const lastCandleStick = this.candleSticks[this.candleSticks.length - 1];
      while (this.candleSticks.length > 0 && this.candleSticks.length < 60) {
        this.candleSticks.push(lastCandleStick);
      }
    }
  }

  mapRestApiDataToCandleSticks(data) {}

  initWebSocket() {
    const wsOptions = {};

    if (this.proxyAgent) {
      wsOptions.agent = this.proxyAgent;
    }

    this.ws = new WebSocket(this.settings.ws, wsOptions);
    this.ws.on("error", this.handleWSError);
    this.ws.on("close", this.handleCloseWS);

    this.ws.on("open", () => {
      logger.log(`Connected to ${this.settings.name}`);
      this.lastWsErrorTime = null;
      this.handleOpenWS();
      this.ws.on("message", this.handleMessage);
    });
  }

  handleCloseWS(event) {
    logger.logWarning(
      `${this.settings.name} - Disconnected: ${event} - Retry in 30 seconds`
    );
    setTimeout(() => this.initWebSocket(), 30000);
  }

  handleWSError(event) {
    let logLevel = "warning";
    if (this.lastWsErrorTime) {
      const currentTime = new Date();

      if (currentTime.getTime() - this.lastWsErrorTime.getTime() >= 3600000) {
        logLevel = "error";
        this.lastWsErrorTime = currentTime;
      }
    } else {
      logLevel = "error";
      this.lastWsErrorTime = new Date();
    }
    console.log(this.configName);
    console.log(event);
    logger.log(
      `${this.settings.name} - Error: ${JSON.stringify(event)}`,
      logLevel
    );
  }

  handleOpenWS() {}

  async handleMessage(data) {}

  updateLatestCandleStick(candle) {
    this.runningCandleStick = candle;
  }

  checkCandleStickValue() {
    const lastCandle = this.candleSticks[this.candleSticks.length - 2];
    const currentCandle = this.candleSticks[this.candleSticks.length - 1];

    if (
      lastCandle.open === currentCandle.open &&
      lastCandle.close === currentCandle.close &&
      lastCandle.high === currentCandle.high &&
      lastCandle.low === currentCandle.low
    ) {
      const currentTime = new Date();
      const candleTime = lastCandle.time;
      const logLevel =
        currentTime.getTime() > candleTime.getTime() &&
        currentTime.getMinutes() === candleTime.getMinutes()
          ? "critical"
          : "warning";
      logger.log(
        `${
          this.settings.name
        } - The last 2 candles have the same result: ${JSON.stringify(
          lastCandle
        )} - ${JSON.stringify(currentCandle)}`,
        logLevel
      );

      this.ws.close(1000);
    }
  }
}
