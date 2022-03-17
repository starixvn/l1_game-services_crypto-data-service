import appConfigs from "./app-configs";
import HttpsProxyAgent from "https-proxy-agent";
import exchangeSettings from "./exchange/exchange-settings";
import fetch from 'node-fetch';
import WebSocket from "ws";

console.log("Start testing REST Apis with Proxy 10.2.252.100");
let proxyAgent;
if (appConfigs.proxy) {
  proxyAgent = new HttpsProxyAgent({
    host: "10.2.252.100",
    port: 8801,
    protocol: "http",
  });
}

const funcs = Object.values(exchangeSettings).map((settings) => {
  return async function () {
    const start = new Date();
    let end = null;
    try {
      const options = {
        agent: proxyAgent,
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36"},
        compress: true,
        insecureHTTPParser: false
      };

      await fetch(settings.api, options);

      end = new Date();
      console.log(
        `Request to ${settings.api} succeeded, took ${end - start}ms`
      );
    } catch (exception) {
      end = new Date();
      console.log(`Request to ${settings.api} failed took ${end - start}ms`);
      console.log(exception);
    }
  };
});

await Promise.all(funcs.map((f) => f()));

const initWebSocket = (provider, websocketUrl) => {
  const wsOptions = {};

  if (proxyAgent) {
    wsOptions.agent = proxyAgent;
  }

  const ws = new WebSocket(websocketUrl, wsOptions);

  ws.on("open", () => {
    console.log(`Connected ${provider}`);

    ws.close();
  });

  ws.on("error", (err) => {
    console.log(`Connected ${provider} failed!!!!`);
    console.log(err);
  })
};

Object.values(exchangeSettings).forEach(settings => {
  initWebSocket(settings.name, settings.ws);
});
