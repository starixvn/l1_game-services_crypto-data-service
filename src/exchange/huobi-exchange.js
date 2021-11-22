import { logger } from "sc-common";
import zlib from "zlib";

import Exchange from ".";
import CandleStick from "../candle-stick";

export default class HuobiExchange extends Exchange {
    constructor(huobiSettings) {
        super(huobiSettings);
    }

    handleOpenWS() {
        this.ws.send(
            JSON.stringify({
                sub: "market.btcusdt.kline.1min",
                id: "id1",
            })
        );
    }

    mapRestApiDataToCandleSticks(data) {
        return data.data.reverse().map((x) => new CandleStick(x.id * 1000, x.open, x.close, x.high, x.low));
    }

    async handleMessage(data) {
        zlib.unzip(data, async (err, buffer) => {
            if (err) {
                logger.log(err, "error");
            } else {
                const unzipData = JSON.parse(buffer.toString("utf8"));
                const { tick, ping } = unzipData;

                if (ping) {
                    this.ws.send(JSON.stringify({ pong: ping }));
                }

                if (tick) {
                    const candle = new CandleStick(tick.id * 1000, tick.open, tick.close, tick.high, tick.low);

                    await this.updateLatestCandleStick(candle);
                }
            }
        });
    }
}
