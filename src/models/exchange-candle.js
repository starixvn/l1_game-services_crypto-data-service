import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    time: { type: Date, required: true },
    open: { type: Number, required: true },
    close: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
  },
  { _id: false }
);

const Schema = new mongoose.Schema({
  result: resultSchema,
  time: { type: Date, default: new Date() },
});

export const BinanceRounds = mongoose.model("binance_rounds", Schema);
export const HuobiRounds = mongoose.model("huobi_rounds", Schema);
export const MexcRounds = mongoose.model("mexc_rounds", Schema);
