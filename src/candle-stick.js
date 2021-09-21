export default class CandleStick {
  constructor(time, open, close, high, low) {
      this.time = new Date(time);
      this.open = open;
      this.close = close;
      this.high = high;
      this.low = low;
  }
}
