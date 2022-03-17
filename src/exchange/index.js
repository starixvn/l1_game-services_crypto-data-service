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

    if (appConfigs.proxy) {
      this.proxyAgent = new HttpsProxyAgent(appConfigs.proxy);
    }
  }

  async getLatestCandleSticks() {
    const start = new Date();
    let end = null;
    try {
      const axiosOptions = {
        timeout: 60000
      };

      if (this.proxyAgent) {
        axiosOptions.httpsAgent = this.proxyAgent;
      }

      const responseData = await axios.get(this.settings.api, axiosOptions);
      end = new Date();
      const candleSticks = this.mapRestApiDataToCandleSticks(responseData.data);
      this.runningCandleStick = candleSticks[candleSticks.length - 1];
      this.candleSticks = candleSticks;
    } catch (exception) {
      end = new Date();
      logger.log(exception, "error");
    } finally {
      logger.log(`Request to ${this.settings.api} took ${end-start}ms`);
    }

    return this.candleSticks;
  }

  mapRestApiDataToCandleSticks(data) {}

  initWebSocket() {
    const wsOptions = {};

    if (this.proxyAgent) {
      wsOptions.agent = this.proxyAgent;
    }

    this.ws = new WebSocket(this.settings.ws, wsOptions);

    this.ws.on("close", this.handleCloseWS);
    this.ws.on("error", this.handleWSError);

    this.ws.on("open", () => {
      this.handleOpenWS();
      this.ws.on("message", this.handleMessage);
    });
  }

  handleCloseWS(event) {
    logger.logWarning(`${this.settings.name} - Disconnected: ${event} - Reconnect in 30 seconds`);
    setTimeout(() => this.initWebSocket(), 30000);
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
