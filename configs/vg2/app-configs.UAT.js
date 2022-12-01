export default {
  hostingPort: 5000,
  enabledLogs: true,
  database: {
    url: "mongodb://lmn_backend:LmnBackend%4022027@10.99.99.187:37201/?replicaSet=SabaL2UAT",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auto_reconnect: true,
    },
  },
  sentry: {
    sentryUrl: "http://8ac47fca6d3e4a41908896a64ef201ac@10.2.190.51:9009/53",
    logIdentifier: "crypto-data-service",
    env: "UAT",
  },
  proxy: {
    binance: {
      host: "10.40.40.245",
      port: 3128,
      protocol: "http",
    },
    huobi: {
      host: "10.40.40.245",
      port: 3128,
      protocol: "http",
    },
    mexc: {
      host: "10.2.252.100",
      port: 8801,
      protocol: "http",
    },
    okex: {
      host: "10.40.40.245",
      port: 3128,
      protocol: "http",
    },
  },
};
