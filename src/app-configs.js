export default {
  hostingPort: 5000,
  enabledLogs: false,
  database: {
    url: "mongodb://localhost:27017",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auto_reconnect: true,
    },
  },
  sentry: {
    sentryUrl:
      "https://8c8a6d0dd58d4d18aa41e703bde72db3@sentryuat.sabagame.com/134",
    logIdentifier: "crypto-data-service",
    env: "LOCAL",
  },
};
