import mongoose from "mongoose";

const Schema = new mongoose.Schema({
  time: { type: Date, default: new Date() },
  average: { type: Object, required: true },
  binance: { type: Object, required: true },
  huobi: { type: Object, required: true },
  mexc: { type: Object, required: true },
  okex: { type: Object, required: true },
});

const CryptoCandleSticks = mongoose.model("crypto_candlesticks", Schema);

export default CryptoCandleSticks;
