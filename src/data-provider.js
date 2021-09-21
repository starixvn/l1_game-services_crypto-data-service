import CandleStick from "./candle-stick";
import { BinanceExchange, HuobiExchange, MexcExchange } from "./exchange";
import {
  BinanceRounds,
  HuobiRounds,
  MexcRounds,
} from "./models/exchange-candle";

export default class DataProvider {
  constructor() {
    this.binanceExchange = new BinanceExchange(
      "https://api.binance.com/api/v3/klines?interval=1m&symbol=BTCUSDT&limit=30",
      "wss://stream.binance.com:9443/ws/btcusdt@kline_1m",
      BinanceRounds
    );

    this.huobiExchange = new HuobiExchange(
      "https://api.huobi.pro/market/history/kline?symbol=btcusdt&period=1min&size=30",
      "wss://api.huobi.pro/ws",
      HuobiRounds
    );

    this.mexcExchange = new MexcExchange(
      "https://www.mexc.com/open/api/v2/market/kline?symbol=BTC_USDT&interval=1m&limit=30",
      "wss://contract.mexc.com/ws",
      MexcRounds
    );

    this.klines = [];
  }

  async init() {
    //await this.initKlineData();
    this.initWebSocket();
  }

  initWebSocket() {
    this.binanceExchange.initWebSocket();
    this.huobiExchange.initWebSocket();
    this.mexcExchange.initWebSocket();
  }

  async initKlineData() {
    const [binanceKlines, huobiKlines, mexcKlines] = await Promise.all([
      this.binanceExchange.getKlines(),
      this.huobiExchange.getKlines(),
      this.mexcExchange.getKlines(),
    ]);

    const klines = [];
    for (let i = 0; i < 30; i++) {
      const binanceKline = binanceKlines[i];
      const huobiKline = huobiKlines[i];
      const mexcKline = mexcKlines[i];
      if (
        binanceKline.time.getTime() !== huobiKline.time.getTime() ||
        binanceKline.time.getTime() !== mexcKline.time.getTime()
      ) {
        console.log(binanceKline);
        console.log(huobiKline);
        console.log(mexcKline);
        return;
      } else {
        klines.push(
          this.calculateAverageCandleStick([
            binanceKline,
            huobiKline,
            mexcKline,
          ])
        );
      }
    }

    this.klines = klines;
  }

  calculateAverageCandleStick(candleSticks) {
    const total = candleSticks.reduce((prev, cur) => ({
      open: prev.open + cur.open,
      close: prev.close + cur.close,
      high: prev.high + cur.high,
      low: prev.low + cur.low,
    }));

    const length = candleSticks.length;

    return new CandleStick(
      candleSticks[0].time,
      total.open / length,
      total.close / length,
      total.high / length,
      total.low / length
    );
  }

  calculateLatestCandleStick() {
    const candleSticks = [
      this.binanceExchange.latestCandleStick,
      this.huobiExchange.latestCandleStick,
      this.mexcExchange.latestCandleStick,
    ];

    if (
      candleSticks.every(
        (x) => x && x.time.getTime() === candleSticks[0].time.getTime()
      )
    ) {
      const latestCandleStick = this.calculateAverageCandleStick(candleSticks);

      if (
        this.klines[this.klines.length - 1].time.getTime() <
        latestCandleStick.time.getTime()
      ) {
        this.klines.shift();
        this.klines.push(latestCandleStick);
      } else {
        this.klines[this.klines.length - 1] = latestCandleStick;
      }
    }
  }
}
