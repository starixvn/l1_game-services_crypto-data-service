export default {
    hostingPort: 5000,
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend%4022027@10.99.99.187:27201/?replicaSet=SabaUAT",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    sentry: {
        sentryUrl:
            "http://52368c4019044019885440599c180bda@10.2.190.51:9009/24",
        logIdentifier: "crypto-data-service",
        env: "UAT",
    },
    proxy: {
        binance: {
            host: "lisasqd.nebula.prod",
            port: 8801,
            protocol: "http",
        },
        huobi: {
            host: "lisasqd.nebula.prod",
            port: 8801,
            protocol: "http",
        },
        mexc: {
            host: "lisasqd.nebula.prod",
            port: 8801,
            protocol: "http",
        },
        okex: {
            host: "lisasqd.nebula.prod",
            port: 8801,
            protocol: "http",
        },
    },
};
