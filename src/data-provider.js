import CandleStick from "./candle-stick";
import { BinanceExchange, HuobiExchange, MexcExchange } from "./exchange";
import CryptoExchanges from "./models/crypto-exchange";
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

    this.cryptoExchangeRepository = CryptoExchanges;

    this.averageCandleSticks = [];
  }

  async init() {
    await this.initKlineData();
    this.initWebSocket();
    this.initCron();
  }

  initCron() {
    this.intervalId = setInterval(async () => {
      await this.updateExchangeData();
    }, 1000);
  }

  initWebSocket() {
    this.binanceExchange.initWebSocket();
    this.huobiExchange.initWebSocket();
    this.mexcExchange.initWebSocket();
  }

  async initKlineData() {
    await Promise.all([
      this.binanceExchange.getKlines(),
      this.huobiExchange.getKlines(),
      this.mexcExchange.getKlines(),
    ]);
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

  updateAverageCandleSticks() {
    for (let i = 0; i < 30; i++) {
      const binance = this.binanceExchange.candleSticks[i];
      const huobi = this.huobiExchange.candleSticks[i];
      const mexc = this.mexcExchange.candleSticks[i];

      this.averageCandleSticks.push(
        this.calculateAverageCandleStick([binance, huobi, mexc])
      );
    }
  }

  async updateExchangeData() {
    const runningCandleSticks = [
      this.binanceExchange.runningCandleStick,
      this.huobiExchange.runningCandleStick,
      this.mexcExchange.runningCandleStick,
    ];

    if (
      runningCandleSticks.every(
        (x) => x && x.time.getTime() === runningCandleSticks[0].time.getTime()
      )
    ) {
      if (this.averageCandleSticks.length === 0) {
        this.updateAverageCandleSticks();
      }

      const runningCandleStick =
        this.calculateAverageCandleStick(runningCandleSticks);

      if (
        this.averageCandleSticks[
          this.averageCandleSticks.length - 1
        ].time.getTime() < runningCandleStick.time.getTime()
      ) {
        this.averageCandleSticks.shift();
        this.averageCandleSticks.push(runningCandleStick);
      } else {
        this.averageCandleSticks[this.averageCandleSticks.length - 1] =
          runningCandleStick;
      }

      const updateObj = {
        runningCandleStick,
        averageCandleSticks: this.averageCandleSticks,
        binance: this.binanceExchange.candleSticks,
        huobi: this.huobiExchange.candleSticks,
        mexc: this.mexcExchange.candleSticks,
        updatedTime: new Date(),
      };

      await this.cryptoExchangeRepository.updateOne(
        {},
        {
          $set: updateObj,
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }
}
