import axios from "axios";
import { logger } from "sc-common";
import WebSocket from "ws";
import HttpsProxyAgent from "https-proxy-agent";
import appConfigs from "../app-configs";

export default class Exchange {
  runningCandleStick;
  candleSticks;
  ws;

  constructor(settings) {
    this.settings = settings;
    this.candleSticks = [];

    this.handleMessage = this.handleMessage.bind(this);
    this.handleWSError = this.handleWSError.bind(this);
    this.handleCloseWS = this.handleCloseWS.bind(this);
  }

  async getLatestCandleSticks() {
    try {
      const axiosOptions = {};

      if (appConfigs.proxy) {
        axiosOptions.proxy = appConfigs.proxy;
      }

      const responseData = await axios.get(this.settings.api, axiosOptions);
      const candleSticks = this.mapRestApiDataToCandleSticks(responseData.data);
      this.runningCandleStick = candleSticks[candleSticks.length - 1];
      this.candleSticks = candleSticks;
    } catch (exception) {
      logger.log(exception, "error");
    }

    return this.candleSticks;
  }

  mapRestApiDataToCandleSticks(data) {}

  initWebSocket() {
    const wsOptions = {};

    if (appConfigs.proxy) {
      wsOptions.agent = new HttpsProxyAgent(appConfigs.proxy);
    }

    this.ws = new WebSocket(this.settings.ws, wsOptions);

    this.ws.on("open", () => {
      this.handleOpenWS();

      this.ws.on("close", this.handleCloseWS);

      this.ws.on("error", this.handleWSError);

      this.ws.on("message", this.handleMessage);
    });
  }

  handleCloseWS(event) {
    logger.logWarning(`${this.settings.name} - Disconnected: ${event}`);
    this.initWebSocket();
  }

  handleWSError(event) {
    logger.logError(`${this.settings.name} - Error: ${event}`);
  }

  handleOpenWS() {}

  async handleMessage(data) {}

  updateLatestCandleStick(candle) {
    this.runningCandleStick = candle;
  }
}
