export default {
	binance: {
		name: "Binance",
		api: "https://api.binance.com/api/v3/klines?interval=1m&symbol=BTCUSDT&limit=60",
		ws: "wss://stream.binance.com:9443/ws/btcusdt@kline_1m",
	},
	huobi: {
		name: "Huobi",
		api: "https://api.huobi.pro/market/history/kline?symbol=btcusdt&period=1min&size=60",
		ws: "wss://api.huobi.pro/ws",
	},
	mexc: {
		name: "Mexc",
		api: "https://api.mexc.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60",
		ws: "wss://wbs.mexc.com/ws",
	},
	okex: {
		name: "Okex",
		api: "https://www.okx.com/api/v5/market/candles?limit=60&bar=1m&instId=BTC-USDT",
		ws: "wss://wsaws.okx.com:8443/ws/v5/business",
	},
};
