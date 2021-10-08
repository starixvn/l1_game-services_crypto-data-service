import CandleStick from "./candle-stick";
import { round } from "mathjs";

export default class DataProvider {
  constructor(exchanges, cryptoExchangeRepository) {
    this.cryptoExchangeRepository = cryptoExchangeRepository;
    this.exchangeArr = Object.values(exchanges);
    this.exchanges = exchanges;
    this.averageCandleSticks = [];
  }

  async init() {
    await this.initGettingLatestCandleSticks();
    this.initWebSocket();
    this.initCron();
  }

  initCron() {
    this.intervalId = setInterval(async () => {
      await this.updateExchangeData();
    }, 1000);
  }

  initWebSocket() {
    this.exchangeArr.forEach((exchange) => exchange.initWebSocket());
  }

  async initGettingLatestCandleSticks() {
    await Promise.all(
      this.exchangeArr.map((exchange) => exchange.getLatestCandleSticks())
    );

    this.updateAverageCandleSticks();
  }

  calculateAverageCandleStick(candleSticks, time) {
    const total = candleSticks.reduce((prev, cur) => ({
      open: prev.open + cur.open,
      close: prev.close + cur.close,
      high: prev.high + cur.high,
      low: prev.low + cur.low,
    }));
    const { length } = candleSticks;

    return new CandleStick(
      time,
      round(total.open / length, 2),
      round(total.close / length, 2),
      round(total.high / length, 2),
      round(total.low / length, 2)
    );
  }

  updateAverageCandleSticks() {
    const exchangeCandleSticks = this.exchangeArr.map(
      (exchange) => exchange.candleSticks
    );

    const now = new Date();
    now.setSeconds(0, 0);

    for (let i = 29; i >= 0; i--) {
      this.averageCandleSticks.unshift(
        this.calculateAverageCandleStick(
          exchangeCandleSticks.map((x) => x[i]),
          now
        )
      );
      now.setMinutes(now.getMinutes() - 1);
    }
  }

  updateRunningCandleStick() {
    const runningCandleSticks = this.exchangeArr.map(
      (exchange) => exchange.runningCandleStick
    );

    const now = new Date();
    now.setSeconds(0, 0);
    this.runningCandleStick = this.calculateAverageCandleStick(
      runningCandleSticks,
      now
    );
  }

  async updateExchangeData() {
    try {
      this.updateRunningCandleStick();

      const now = new Date();

      if (now.getSeconds() === 0) {
        this.averageCandleSticks.shift();
        this.averageCandleSticks.push(this.runningCandleStick);
        this.exchangeArr.forEach((exchange) => {
          exchange.candleSticks.shift();
          exchange.candleSticks.push(exchange.runningCandleStick);
        });
      } else {
        this.averageCandleSticks[this.averageCandleSticks.length - 1] =
          this.runningCandleStick;

        this.exchangeArr.forEach((exchange) => {
          exchange.candleSticks[exchange.candleSticks.length - 1] =
            exchange.runningCandleStick;
        });
      }

      const updateObj = {
        runningCandleStick: this.runningCandleStick,
        averageCandleSticks: this.averageCandleSticks,
        binance: this.exchanges.binanceExchange.candleSticks,
        huobi: this.exchanges.huobiExchange.candleSticks,
        mexc: this.exchanges.mexcExchange.candleSticks,
        okex: this.exchanges.okexExchange.candleSticks,
        updatedTime: new Date(),
      };

      await this.cryptoExchangeRepository.updateOne(
        {},
        {
          $set: updateObj,
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    } catch (exception) {
      logger.log(exception, "error");
    }
  }
}
