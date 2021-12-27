import { round } from "mathjs";
import { logger } from "sc-common";
import cron from "cron";

import CandleStick from "./candle-stick";

export default class DataProvider {
  constructor(
    cryptoExchangeRepository,
    cryptoCandleSticksRepository,
    binanceExchange,
    huobiExchange,
    mexcExchange,
    okexExchange
  ) {
    this.cryptoExchangeRepository = cryptoExchangeRepository;
    this.cryptoCandleSticksRepository = cryptoCandleSticksRepository;

    this.exchanges = {
      binanceExchange,
      huobiExchange,
      mexcExchange,
      okexExchange,
    };

    this.exchangeArr = Object.values(this.exchanges);
    this.averageCandleSticks = [];
  }

  async init() {
    const currentCandleSticks = await this.cryptoCandleSticksRepository
      .find({}, null, { limit: 60, sort: { time: -1 } })
      .lean()
      .exec();
    currentCandleSticks.reverse();

    await this.initGettingLatestCandleSticks(currentCandleSticks);

    if (this.exchangeArr.some((x) => x.candleSticks.length > 0)) {
      this.updateAverageCandleSticks(currentCandleSticks);
      this.initWebSocket();
      this.initCron();
    } else {
      logger.logError(
        "Cant get any data from all exchanges, retry in 60 seconds"
      );
      setTimeout(() => this.init(), 60000);
    }
  }

  initCron() {
    const job = new cron.CronJob(
      "* * * * * *",
      () => this.updateExchangeData().catch(logger.logError),
      () => {
        logger.logError(
          `cron unexpectedly stopped at${new Date().toUTCString()}`
        );
        job.start();
      }
    );

    job.start();
  }

  initWebSocket() {
    this.exchangeArr.forEach((exchange) => exchange.initWebSocket());
  }

  async initGettingLatestCandleSticks(currentCandleSticks) {
    await Promise.all(
      this.exchangeArr.map((exchange) =>
        exchange.getLatestCandleSticks(currentCandleSticks)
      )
    );
  }

  calculateAverageCandleStick(candleSticks, time) {
    const total = candleSticks
      .filter((x) => x)
      .reduce((prev, cur) => ({
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

  updateAverageCandleSticks(currentCandleSticks) {
    const exchangeCandleSticks = this.exchangeArr
      .filter((exchange) => exchange.candleSticks.length > 0)
      .map((exchange) => exchange.candleSticks);

    const now = new Date();
    now.setSeconds(0, 0);

    for (let i = 59; i >= 0; i--) {
      const current = currentCandleSticks.find(
        (x) => x.time.getTime() === now.getTime()
      );

      this.averageCandleSticks.unshift(
        current
          ? current.average
          : this.calculateAverageCandleStick(
              exchangeCandleSticks.map((x) => x[i]),
              now
            )
      );
      now.setMinutes(now.getMinutes() - 1);
    }
  }

  updateRunningCandleStick() {
    const runningCandleSticks = this.exchangeArr
      .filter((exchange) => exchange.runningCandleStick)
      .map((exchange) => exchange.runningCandleStick);
    const { length } = runningCandleSticks;

    const now = new Date();
    now.setSeconds(0, 0);
    const currentTick = now.getTime();

    let open = 0;
    let close = 0;
    let high = 0;
    let low = 0;

    runningCandleSticks.forEach((x) => {
      if (x.time.getTime() === currentTick) {
        open += x.open;
      } else {
        open += x.close;
      }
      close += x.close;
      high += x.high;
      low += x.low;
    });

    const candleStick = new CandleStick(
      now,
      round(open / length, 2),
      round(close / length, 2),
      round(high / length, 2),
      round(low / length, 2)
    );

    const { runningCandleStick } = this;

    if (
      runningCandleStick &&
      runningCandleStick.time.getTime() === currentTick
    ) {
      candleStick.open = runningCandleStick.open;
    }

    const min = Math.min(candleStick.close, candleStick.open);
    const max = Math.max(candleStick.close, candleStick.open);

    if (candleStick.low > min) {
      candleStick.low = min;
    }

    if (candleStick.high < max) {
      candleStick.high = max;
    }

    this.runningCandleStick = candleStick;
  }

  async updateExchangeData() {
    this.updateRunningCandleStick();
    const now = new Date();
    if (now.getSeconds() === 0) {
      this.checkCandleStickValue();
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

    await Promise.all([
      this.cryptoCandleSticksRepository.updateOne(
        { time: this.runningCandleStick.time },
        {
          $set: {
            time: this.runningCandleStick.time,
            average: this.runningCandleStick,
            binance: this.exchanges.binanceExchange.runningCandleStick,
            huobi: this.exchanges.huobiExchange.runningCandleStick,
            mexc: this.exchanges.mexcExchange.runningCandleStick,
            okex: this.exchanges.okexExchange.runningCandleStick,
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      ),
      this.cryptoExchangeRepository.updateOne(
        {},
        {
          $set: {
            runningCandleStick: this.runningCandleStick,
            averageCandleSticks: this.averageCandleSticks,
            binance: this.exchanges.binanceExchange.candleSticks,
            huobi: this.exchanges.huobiExchange.candleSticks,
            mexc: this.exchanges.mexcExchange.candleSticks,
            okex: this.exchanges.okexExchange.candleSticks,
            updatedTime: new Date(),
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      ),
    ]);
  }

  checkCandleStickValue() {
    const lastCandle =
      this.averageCandleSticks[this.averageCandleSticks.length - 2];
    const currentCandle =
      this.averageCandleSticks[this.averageCandleSticks.length - 1];

    if (
      lastCandle.open === currentCandle.open &&
      lastCandle.close === currentCandle.close &&
      lastCandle.high === currentCandle.high &&
      lastCandle.low === currentCandle.low
    ) {
      logger.logCritical(
        `The last 2 candles have the same result: ${JSON.stringify(
          lastCandle
        )} - ${JSON.stringify(currentCandle)}`
      );
    }
  }
}
