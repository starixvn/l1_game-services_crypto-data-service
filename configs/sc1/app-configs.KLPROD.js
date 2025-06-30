export default {
  hostingPort: 5000,
  enabledLogs: true,
  database: {
    url: "mongodb://lmn_backend:M7K4ttH%2AtZ3ml%3F%29%7CA%5DjN4%3FLBhwF%266IO%3C@10.146.34.26:39110,10.146.34.27:39110,10.146.34.30:39110,10.146.34.28:39110/?replicaSet=SabaMain",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auto_reconnect: true,
    },
  },
  sentry: {
    sentryUrl: "http://58fc00e79ab34a3bab04a79038760cb8@sentry-scklprod-ovs.ops-klprod.gamora.prod/8",
    logIdentifier: "crypto-data-service",
    env: "PROD",
  },
  proxy: {
     binance: {
      host: "iusqd.gamora.prod",
      port: 8801,
      protocol: "http",
    },
    huobi: {
      host: "iusqd.gamora.prod",
      port: 8801,
      protocol: "http",
    },
    mexc: {
      host: "iusqd.gamora.prod",
      port: 8801,
      protocol: "http",
    },
    okex: {
      host: "iusqd.gamora.prod",
      port: 8801,
      protocol: "http",
    },
  },
};
