import appConfigs from "./app-configs";
import HttpsProxyAgent from "https-proxy-agent";
import exchangeSettings from "./exchange/exchange-settings";
import WebSocket from "ws";

console.log(`Start testing websocket with Proxy 10.40.40.245`);
let proxyAgent;
if (appConfigs.proxy) {
  proxyAgent = new HttpsProxyAgent(appConfigs.proxy);
}

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
