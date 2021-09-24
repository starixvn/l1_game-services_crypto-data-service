import CandleStick from "./candle-stick";

export default class DataProvider {
  constructor(exchanges, cryptoExchangeRepository) {
    this.cryptoExchangeRepository = cryptoExchangeRepository;
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
    Object.values(this.exchanges).forEach((exchange) =>
      exchange.initWebSocket()
    );
  }

  async initGettingLatestCandleSticks() {
    await Promise.all(
      Object.values(this.exchanges).map((exchange) =>
        exchange.getLatestCandleSticks()
      )
    );
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
    const exchangeCandleSticks = Object.values(this.exchanges).map(
      (exchange) => exchange.candleSticks
    );
    for (let i = 0; i < 30; i++) {
      this.averageCandleSticks.push(
        this.calculateAverageCandleStick(exchangeCandleSticks.map((x) => x[i]))
      );
    }
  }

  async updateExchangeData() {
    const runningCandleSticks = Object.values(this.exchanges).map(
      (exchange) => exchange.runningCandleStick
    );

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
      //console.log(runningCandleStick);

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
    }
  }
}
