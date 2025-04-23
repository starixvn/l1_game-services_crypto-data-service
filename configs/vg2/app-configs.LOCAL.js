export default {
  hostingPort: 5000,
  enabledLogs: true,
  database: {
    url: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39200,10.10.50.13:39200,10.10.50.14:39200/?replicaSet=L2Local",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auto_reconnect: true,
    },
  },
  sentry: {
    sentryUrl:
      "https://acb36eb835d948d68c1aad9873754d51@sentry.lumigame.com/27",
    logIdentifier: "crypto-data-service",
    env: "LOCAL_1",
  },
};
