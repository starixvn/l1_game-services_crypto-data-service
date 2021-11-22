import Exchange from ".";
import CandleStick from "../candle-stick";

export default class BinanceExchange extends Exchange {
    constructor(binanceSettings) {
        super(binanceSettings);
    }

    async handleMessage(data) {
        const jsonObj = JSON.parse(data);
        const kLine = jsonObj["k"];

        if (kLine) {
            const candle = new CandleStick(
                parseInt(kLine["t"]),
                parseFloat(kLine["o"]),
                parseFloat(kLine["c"]),
                parseFloat(kLine["h"]),
                parseFloat(kLine["l"])
            );

            this.updateLatestCandleStick(candle);
        }
    }

    mapRestApiDataToCandleSticks(data) {
        return data.map((x) => new CandleStick(parseInt(x[0]), parseFloat(x[1]), parseFloat(x[4]), parseFloat(x[2]), parseFloat(x[3])));
    }
}
