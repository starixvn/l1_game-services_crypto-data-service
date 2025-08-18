export default {
    hostingPort: 5000,
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend%4022027@10.146.34.26:39110,10.146.34.27:39110,10.146.34.30:39110,10.146.34.28:39110/?replicaSet=SabaMain",
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
            host: "iusqd-uat.gamora.prod",
            port: 8801,
            protocol: "http",
        },
        huobi: {
            host: "iusqd-uat.gamora.prod",
            port: 8801,
            protocol: "http",
        },
        mexc: {
            host: "iusqd-uat.gamora.prod",
            port: 8801,
            protocol: "http",
        },
        okex: {
            host: "iusqd-uat.gamora.prod",
            port: 8801,
            protocol: "http",
        },
    },
};
