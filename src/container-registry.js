import { asClass, asValue, createContainer, InjectionMode } from "awilix";

import DataProvider from "./data-provider";
import BinanceExchange from "./exchange/binance-exchange";
import HuobiExchange from "./exchange/huobi-exchange";
import MexcExchange from "./exchange/mexc-exchange";
import OkexExchange from "./exchange/okex-exchange";
import CryptoCandleSticks from "./models/crypto-candlestick";
import CryptoExchanges from "./models/crypto-exchange";

export default class ContainerRegistry {
    /**
     * @param {InjectionMode} defaultInjectionMode
     */
    constructor(defaultInjectionMode = InjectionMode.CLASSIC) {
        this.container = createContainer({ injectionMode: defaultInjectionMode });
    }

    /**
     * @param {Object} exchangeSettings
     */

    register(exchangeSettings) {
        this.container.register({
            exchangeSettings: asValue(exchangeSettings),
            binanceSettings: asValue(exchangeSettings.binance),
            huobiSettings: asValue(exchangeSettings.huobi),
            mexcSettings: asValue(exchangeSettings.mexc),
            okexSettings: asValue(exchangeSettings.okex),
        });

        this.registerModels();
        this.registerExchanges();

        return this.container;
    }

    registerExchanges() {
        this.container.register({
            dataProvider: asClass(DataProvider).singleton(),
        });

        this.container.register({
            binanceExchange: asClass(BinanceExchange).singleton(),
            huobiExchange: asClass(HuobiExchange).singleton(),
            mexcExchange: asClass(MexcExchange).singleton(),
            okexExchange: asClass(OkexExchange).singleton(),
        });
    }

    registerModels() {
        this.container.register({
            cryptoExchangeRepository: asValue(CryptoExchanges),
            cryptoCandleSticksRepository: asValue(CryptoCandleSticks),
        });
    }
}
