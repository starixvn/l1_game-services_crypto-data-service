export default {
  hostingPort: 5000,
  enabledLogs: true,
  database: {
    url: "mongodb://lmn_backend:%21%23x97%25uYZv%2A%5E%25%3E%7C%2Aqg%40E7FHi%3F9l%7B9r%3CK@10.146.34.26:39210,10.146.34.27:39210,10.146.34.30:39210,10.146.34.28:39210/?replicaSet=L2_SabaMain",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auto_reconnect: true,
    },
  },
  sentry: {
    sentryUrl: "http://2b5b82bf699543ddb296364568bc30be@sentry-scklprod-ovs.ops-klprod.gamora.prod/52",
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
