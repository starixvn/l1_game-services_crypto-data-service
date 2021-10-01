import CandleStick from "./candle-stick";

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
      total.open / length,
      total.close / length,
      total.high / length,
      total.low / length
    );
  }

  updateAverageCandleSticks() {
    const exchangeCandleSticks = this.exchangeArr.map(
      (exchange) => exchange.candleSticks
    );

    const now = new Date();
    now.setSeconds(0, 0);

    for (let i = 29; i >= 0; i--) {
      this.averageCandleSticks.push(
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
    const runningCandleStick = this.calculateAverageCandleStick(
      runningCandleSticks,
      now
    );

    if (
      this.runningCandleStick &&
      this.runningCandleStick.time.getTime() ===
        runningCandleStick.time.getTime()
    ) {
      this.runningCandleStick.close = runningCandleStick.close;
      this.runningCandleStick.high = runningCandleStick.high;
      this.runningCandleStick.low = runningCandleStick.low;
    } else {
      this.runningCandleStick = runningCandleStick;
    }
  }

  async updateExchangeData() {
    this.updateRunningCandleStick();

    const now = new Date();

    if (now.getSeconds() === 0) {
      console.log("add");

      this.averageCandleSticks.shift();
      this.averageCandleSticks.push(this.runningCandleStick);
      this.exchangeArr.forEach((exchange) => {
        exchange.candleSticks.shift();
        exchange.candleSticks.push(exchange.runningCandleStick);
      });
    } else {
      console.log("update");
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
  }
}
