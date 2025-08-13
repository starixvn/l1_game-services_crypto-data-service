import { logger } from "sc-common";
import Exchange from ".";
import CandleStick from "../candle-stick";

export default class MexcExchange extends Exchange {
    constructor(mexcSettings) {
        super(mexcSettings);
    }

    handleCloseWS(event) {
        clearInterval(this.intervalId);
        super.handleCloseWS(event);
    }

    handleOpenWS() {
        this.intervalId = setInterval(
            () =>
                this.ws.send(
                    JSON.stringify({
                        method: "PING",
                    })
                ),
            20000
        );
        this.ws.send(
            JSON.stringify({
                method: "SUBSCRIPTION",
                params: ["spot@public.kline.v3.api.pb@BTCUSDT@Min1"],
            })
        );
    }

    mapRestApiDataToCandleSticks(data) {
        return data.map(
            (x) =>
                new CandleStick(
                    x[0],
                    parseFloat(x[1]),
                    parseFloat(x[4]),
                    parseFloat(x[2]),
                    parseFloat(x[3])
                )
        );
    }

    async handleMessage(data) {
        try {
            const jsonObj = JSON.parse(data);
            console.log(data);
            console.log(jsonObj);

            if (
                jsonObj.channel === "spot@public.kline.v3.api.pb@BTCUSDT@Min1"
            ) {
                console.log(jsonObj);
                const kline = jsonObj.publicspotkline;
                const candle = new CandleStick(
                    jsonObj.createtime * 1000,
                    parseFloat(kline.openingprice),
                    parseFloat(kline.closingprice),
                    parseFloat(kline.highestprice),
                    parseFloat(kline.lowestprice)
                );

                this.updateLatestCandleStick(candle);
            }
        } catch (exception) {
            logger.logError(exception);
        }
    }
}
