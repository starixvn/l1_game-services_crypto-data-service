export default {
  hostingPort: 5000,
  enabledLogs: true,
  database: {
    url: "mongodb://lmn_backend:%21%23x97%25uYZv%2A%5E%25%3E%7C%2Aqg%40E7FHi%3F9l%7B9r%3CK@10.99.99.53:37101,10.99.99.54:37102/?replicaSet=L2_SabaMain",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auto_reconnect: true,
    },
  },
  sentry: {
    sentryUrl: "http://2b5b82bf699543ddb296364568bc30be@10.2.189.50:9009/52",
    logIdentifier: "crypto-data-service",
    env: "PROD",
  },
  proxy: {
    binance: {
      host: "10.40.40.245",
      port: 3128,
      protocol: "http",
    },
    huobi: {
      host: "10.2.252.100",
      port: 8801,
      protocol: "http",
    },
    mexc: {
      host: "10.2.252.100",
      port: 8801,
      protocol: "http",
    },
    okex: {
      host: "10.2.252.100",
      port: 8801,
      protocol: "http",
    },
  },
};
