export default {
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.14:17101/?replicaSet=L1pLocal",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://13f39b8359404ed5aec23655e64ccf78@sentry.lumigame.com/2",
        logIdentifier: "crypto-data-service",
        env: "LOCAL-1",
    },
};
