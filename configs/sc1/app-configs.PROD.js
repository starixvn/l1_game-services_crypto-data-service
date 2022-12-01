export default {
  hostingPort: 5000,
  enabledLogs: true,
  database: {
    url: "mongodb://lmn_backend:M7K4ttH%2AtZ3ml%3F%29%7CA%5DjN4%3FLBhwF%266IO%3C@10.99.99.54:27101,10.99.99.53:27102/?replicaSet=SabaMain",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auto_reconnect: true,
    },
  },
  sentry: {
    sentryUrl: "http://58fc00e79ab34a3bab04a79038760cb8@10.2.189.50:9009/8",
    logIdentifier: "crypto-data-service",
    env: "PROD",
  },
  proxy: {
    host: "10.40.40.245",
    port: 3128,
    protocol: "http",
  },
};
