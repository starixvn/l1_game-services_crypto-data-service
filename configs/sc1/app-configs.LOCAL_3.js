export default {
  hostingPort: 5000,
  enabledLogs: true,
  database: {
    url: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39103,10.10.50.13:39103,10.10.50.14:39103/?replicaSet=L1pppLocal",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auto_reconnect: true,
    },
  },
  sentry: {
    sentryUrl: "https://50e405ebce7003a0e1edbda2bf28b14c@sentry-k8s.lumigame.com/3",
    logIdentifier: "crypto-data-service",
    env: "LOCAL-3",
  },
};
