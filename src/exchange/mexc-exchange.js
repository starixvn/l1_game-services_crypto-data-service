import { createRequire } from "module";
import { logger } from "sc-common";
import Exchange from ".";
import CandleStick from "../candle-stick";

const require = createRequire(import.meta.url);
const { PushDataV3ApiWrapper } = require("./proto/PushDataV3ApiWrapper_pb.cjs");

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
            if (data.toString().includes('"id":0,"code":0')) {
                return;
            }
            const wrapperMessage = PushDataV3ApiWrapper.deserializeBinary(data);

            if (
                wrapperMessage.getChannel() ===
                "spot@public.kline.v3.api.pb@BTCUSDT@Min1"
            ) {
                const klineData = wrapperMessage.getPublicspotkline();
                if (klineData) {
                    const candle = new CandleStick(
                        wrapperMessage.getCreatetime() ||
                            klineData.getWindowstart(),
                        parseFloat(klineData.getOpeningprice()),
                        parseFloat(klineData.getClosingprice()),
                        parseFloat(klineData.getHighestprice()),
                        parseFloat(klineData.getLowestprice())
                    );

                    this.updateLatestCandleStick(candle);
                }
            }
        } catch (exception) {
            logger.logError(exception);
        }
    }
}
