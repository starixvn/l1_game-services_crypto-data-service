import DataProvider from "./data-provider";
import { middlewares, logger } from "sc-common";
import mongoose from "mongoose";
import appConfigs from "./app-configs";
import CryptoExchanges from "./models/crypto-exchange";
import BinanceExchange from "./exchange/binance-exchange";
import HuobiExchange from "./exchange/huobi-exchange";
import MexcExchange from "./exchange/mexc-exchange";
import OkexExchange from "./exchange/okex-exchange";

const run = async () => {
  await middlewares.database.configureDatabase(mongoose, appConfigs.database);
  if (appConfigs.enabledLogs) {
    logger.start(appConfigs.sentry);
  }

  const binanceExchange = new BinanceExchange(
    "https://api.binance.com/api/v3/klines?interval=1m&symbol=BTCUSDT&limit=30",
    "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
  );

  const huobiExchange = new HuobiExchange(
    "https://api.huobi.pro/market/history/kline?symbol=btcusdt&period=1min&size=30",
    "wss://api.huobi.pro/ws"
  );

  const mexcExchange = new MexcExchange(
    "https://www.mexc.com/open/api/v2/market/kline?symbol=BTC_USDT&interval=1m&limit=30",
    "wss://contract.mexc.com/ws"
  );

  const okexExchange = new OkexExchange(
    "https://www.okex.com/api/v5/market/candles?limit=30&bar=1m&instId=BTC-USDT",
    "wss://ws.okex.com:8443/ws/v5/public"
  );
  const dataProvider = new DataProvider(
    {
      binanceExchange,
      huobiExchange,
      mexcExchange,
      okexExchange,
    },
    CryptoExchanges
  );
  await dataProvider.init();
};

await run();
