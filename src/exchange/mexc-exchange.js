import { logger } from "sc-common";
import Exchange from ".";
import CandleStick from "../candle-stick";

export default class MexcExchange extends Exchange {
  constructor(mexcSettings) {
    super(mexcSettings);
  }

  handleCloseWS(event) {
    clearInterval(this.intervalId);
    super.handleCloseWS(event);
  }

  handleOpenWS() {
    this.intervalId = setInterval(
      () =>
        this.ws.send(
          JSON.stringify({
            method: "ping",
          })
        ),
      20000
    );
    this.ws.send(
      JSON.stringify({
        method: "sub.kline",
        param: {
          symbol: "BTC_USDT",
          interval: "Min1",
        },
      })
    );
  }

  mapRestApiDataToCandleSticks(data) {
    return data.data.map(
      (x) =>
        new CandleStick(
          x[0] * 1000,
          parseFloat(x[1]),
          parseFloat(x[2]),
          parseFloat(x[3]),
          parseFloat(x[4])
        )
    );
  }

  async handleMessage(data) {
    try {
      const jsonObj = JSON.parse(data);

      if (jsonObj.channel === "push.kline") {
        const candle = new CandleStick(
          jsonObj.data.t * 1000,
          jsonObj.data.o,
          jsonObj.data.c,
          jsonObj.data.h,
          jsonObj.data.l
        );

        this.updateLatestCandleStick(candle);
      }
    } catch (exception) {
      logger.logError(exception);
    }
  }
}
