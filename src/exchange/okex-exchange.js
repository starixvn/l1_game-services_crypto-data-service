import Exchange from ".";
import CandleStick from "../candle-stick";

export default class OkexExchange extends Exchange {
    constructor(okexSettings) {
        super(okexSettings);
    }

    handleCloseWS(event) {
        clearInterval(this.intervalId);
        super.handleCloseWS(event);
    }

    handleOpenWS() {
        this.intervalId = setInterval(() => this.ws.send("ping"), 20000);

        this.ws.send(
            JSON.stringify({
                op: "subscribe",
                args: [
                    {
                        channel: "mark-price-candle1m",
                        instId: "BTC-USDT",
                    },
                ],
            })
        );
    }
    async handleMessage(data) {
        if (data.toString() !== "pong") {
            const jsonObj = JSON.parse(data);
            if (jsonObj.data && jsonObj.data.length > 0) {
                const kLine = jsonObj.data[0];
                const candle = new CandleStick(
                    parseInt(kLine[0]),
                    parseFloat(kLine[1]),
                    parseFloat(kLine[4]),
                    parseFloat(kLine[2]),
                    parseFloat(kLine[3])
                );

                this.updateLatestCandleStick(candle);
            }
        }
    }

    mapRestApiDataToCandleSticks(data) {
        return data.data
            .reverse()
            .map((x) => new CandleStick(parseInt(x[0]), parseFloat(x[1]), parseFloat(x[4]), parseFloat(x[2]), parseFloat(x[3])));
    }
}
