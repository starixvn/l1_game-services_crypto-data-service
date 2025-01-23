export default {
    hostingPort: 5000,
    enabledLogs: true,
    database: {
      url: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39202,10.10.50.13:39202,10.10.50.14:39202/?replicaSet=L2ppLocal",
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
      env: "LOCAL-2",
    },
};
  