import { asClass, asValue, createContainer, InjectionMode } from "awilix";
import CryptoCandleSticks from "./models/crypto-candlestick";
import CryptoExchanges from "./models/crypto-exchange";
import BinanceExchange from "./exchange/binance-exchange";
import HuobiExchange from "./exchange/huobi-exchange";
import MexcExchange from "./exchange/mexc-exchange";
import OkexExchange from "./exchange/okex-exchange";

export default class ContainerRegistry {
  /**
   * @param {InjectionMode} defaultInjectionMode
   */
  constructor(defaultInjectionMode = InjectionMode.CLASSIC) {
    this.container = createContainer({ injectionMode: defaultInjectionMode });
  }

  register() {
    this.registerModels();
    return this.container;
  }

  registerExchanges() {
    this.container.register({
      binanceExchange: asValue(
        new BinanceExchange(
          "https://api.binance.com/api/v3/klines?interval=1m&symbol=BTCUSDT&limit=60",
          "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
        )
      ),
      huobiExchange: asValue(
        new HuobiExchange(
          "https://api.huobi.pro/market/history/kline?symbol=btcusdt&period=1min&size=60",
          "wss://api.huobi.pro/ws"
        )
      ),
      mexcExchange: asValue(
        new MexcExchange(
          "https://www.mexc.com/open/api/v2/market/kline?symbol=BTC_USDT&interval=1m&limit=60",
          "wss://contract.mexc.com/ws"
        )
      ),
      okexExchange: asValue(
        new OkexExchange(
          "https://www.okex.com/api/v5/market/candles?limit=60&bar=1m&instId=BTC-USDT",
          "wss://ws.okex.com:8443/ws/v5/public"
        )
      ),
    });
  }

  registerModels() {
    this.container.register({
      cryptoExchangeRepository: asValue(CryptoExchanges),
      cryptoCandleSticksRepository: asValue(CryptoCandleSticks),
    });
  }
}
