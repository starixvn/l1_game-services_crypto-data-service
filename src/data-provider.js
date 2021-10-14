import { round } from "mathjs";
import { logger } from "sc-common";
import cron from "cron";

import CandleStick from "./candle-stick";

export default class DataProvider {
    constructor(cryptoExchangeRepository, cryptoCandleSticksRepository, binanceExchange, huobiExchange, mexcExchange, okexExchange) {
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
        await this.initGettingLatestCandleSticks();
        this.initWebSocket();
        this.initCron();
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

    async initGettingLatestCandleSticks() {
        await Promise.all(this.exchangeArr.map((exchange) => exchange.getLatestCandleSticks()));

        this.updateAverageCandleSticks();
    }

    calculateAverageCandleStick(candleSticks, time) {
        //TODO handle null exception
        const total = candleSticks.filter(x => x).reduce((prev, cur) => ({
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
        const exchangeCandleSticks = this.exchangeArr.map((exchange) => exchange.candleSticks);

        const now = new Date();
        now.setSeconds(0, 0);

        for (let i = 59; i >= 0; i--) {
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
        const runningCandleSticks = this.exchangeArr.map((exchange) => exchange.runningCandleStick);

        const now = new Date();
        now.setSeconds(0, 0);
        this.runningCandleStick = this.calculateAverageCandleStick(runningCandleSticks, now);
    }

    async updateExchangeData() {
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
            this.averageCandleSticks[this.averageCandleSticks.length - 1] = this.runningCandleStick;
            this.exchangeArr.forEach((exchange) => {
                exchange.candleSticks[exchange.candleSticks.length - 1] = exchange.runningCandleStick;
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
}
