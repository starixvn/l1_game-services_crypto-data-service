import WebSocket from "ws";
import axios from "axios";
import { logger } from "sc-common";

export default class Exchange {
  runningCandleStick;
  candleSticks;
  ws;
  roundRepository;

  constructor(apiUrl, wsUrl, roundRepository) {
    this.apiUrl = apiUrl;
    this.wsUrl = wsUrl;
    this.roundRepository = roundRepository;
    this.candleSticks = [];

    this.handleMessage = this.handleMessage.bind(this);
    this.handleWSError = this.handleWSError.bind(this);
    this.handleCloseWS = this.handleCloseWS.bind(this);
  }

  async getLatestCandleSticks() {
    try {
      const responseData = await axios.get(this.apiUrl);
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
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on("open", () => {
      this.handleOpenWS();

      this.ws.on("close", this.handleCloseWS);

      this.ws.on("error", this.handleWSError);

      this.ws.on("message", this.handleMessage);
    });
  }

  handleCloseWS(event) {
    logger.logWarning(`Disconnected: ${event}`);
    this.initWebSocket();
  }

  handleWSError(event) {
    logger.logError(`error: ${event}`);
  }

  handleOpenWS() {}
  async handleMessage(data) {}
  updateLatestCandleStick(candle) {
    this.runningCandleStick = candle;
  }
}
