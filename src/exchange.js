import Candle from "./candle-stick";
import WebSocket from "ws";
import zlib from "zlib";
import axios from "axios";
import { logger } from "sc-common";

export default class Exchange {
  latestCandleStick;
  ws;
  roundRepository;

  constructor(apiUrl, wsUrl, roundRepository) {
    this.apiUrl = apiUrl;
    this.wsUrl = wsUrl;
    this.roundRepository = roundRepository;

    this.handleMessage = this.handleMessage.bind(this);
    this.handleWSError = this.handleWSError.bind(this);
    this.handleCloseWS = this.handleCloseWS.bind(this);
  }

  async getKlines() {
    this.latestCandleStick = (
      await this.roundRepository.findOne({}, "result", {
        sort: { id: -1 },
      })
    )?.result;
    const responseData = await axios.get(this.apiUrl);
    return this.mapRestApiDataToCandleSticks(responseData.data);
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
  async updateLatestCandleStick(candle) {
    console.log(this.roundRepository);
    if (
      this.latestCandleStick &&
      this.latestCandleStick.time.getTime() === candle.time.getTime()
    ) {
      await this.roundRepository.updateOne(
        { "result.time": candle.time },
        { result: candle }
      );
    } else {
      await this.roundRepository.create({
        result: candle,
        time: new Date(),
      });
    }
    this.latestCandleStick = candle;
  }
}

export class BinanceExchange extends Exchange {
  async handleMessage(data) {
    const jsonObj = JSON.parse(data);
    const kLine = jsonObj["k"];

    if (kLine) {
      const candle = new Candle(
        parseInt(kLine["t"]),
        parseFloat(kLine["o"]),
        parseFloat(kLine["c"]),
        parseFloat(kLine["h"]),
        parseFloat(kLine["l"])
      );

      await this.updateLatestCandleStick(candle);
    }
  }

  mapRestApiDataToCandleSticks(data) {
    return data.map(
      (x) =>
        new Candle(
          x[0],
          parseFloat(x[1]),
          parseFloat(x[4]),
          parseFloat(x[2]),
          parseFloat(x[3])
        )
    );
  }
}

export class HuobiExchange extends Exchange {
  handleOpenWS() {
    this.ws.send(
      JSON.stringify({
        sub: "market.btcusdt.kline.1min",
        id: "id1",
      })
    );
  }

  mapRestApiDataToCandleSticks(data) {
    return data.data
      .reverse()
      .map((x) => new Candle(x.id * 1000, x.open, x.close, x.high, x.low));
  }

  async handleMessage(data) {
    ///const jsonObj = JSON.parse(data);
    zlib.unzip(data, async (err, buffer) => {
      const unzipData = JSON.parse(buffer.toString("utf8"));
      const { tick, ping } = unzipData;
      if (ping) {
        this.ws.send(JSON.stringify({ pong: ping }));
      }

      if (tick) {
        const candle = new Candle(
          tick.id * 1000,
          tick.open,
          tick.close,
          tick.high,
          tick.low
        );

        await this.updateLatestCandleStick(candle);
      }
    });
  }
}

export class MexcExchange extends Exchange {
  handleOpenWS() {
    setInterval(
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
        new Candle(
          x[0] * 1000,
          parseFloat(x[1]),
          parseFloat(x[2]),
          parseFloat(x[3]),
          parseFloat(x[4])
        )
    );
  }

  async handleMessage(data) {
    const jsonObj = JSON.parse(data);

    if (jsonObj.channel === "push.kline") {
      const candle = new Candle(
        jsonObj.data.t * 1000,
        jsonObj.data.o,
        jsonObj.data.c,
        jsonObj.data.h,
        jsonObj.data.l
      );

      await this.updateLatestCandleStick(candle);
    }
  }
}
