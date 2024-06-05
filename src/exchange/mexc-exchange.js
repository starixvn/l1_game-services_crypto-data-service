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
        method: "SUBSCRIPTION",
        params: ["spot@public.kline.v3.api@BTCUSDT@Min1"],
      })
    );
  }

  mapRestApiDataToCandleSticks(data) {
    return data.map(
      (x) =>
        new CandleStick(
          x[0] * 1000,
          parseFloat(x[1]),
          parseFloat(x[4]),
          parseFloat(x[2]),
          parseFloat(x[3])
        )
    );
  }

  async handleMessage(data) {
    try {
      const jsonObj = JSON.parse(data);

      if (jsonObj.c === "spot@public.kline.v3.api@BTCUSDT@Min1") {
        const kline = jsonObj.d.k;
        const candle = new CandleStick(
          kline.t * 1000,
          kline.o,
          kline.c,
          kline.h,
          kline.l
        );

        this.updateLatestCandleStick(candle);
      }
    } catch (exception) {
      logger.logError(exception);
    }
  }
}
