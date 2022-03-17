import appConfigs from "./app-configs";
import HttpsProxyAgent from "https-proxy-agent";
import axios from "axios";
import exchangeSettings from "./exchange/exchange-settings";

console.log("Start testing REST Apis");
let proxyAgent;
if (appConfigs.proxy) {
  proxyAgent = new HttpsProxyAgent(appConfigs.proxy);
}

const funcs = Object.values(exchangeSettings).map((settings) => {
  return async function () {
    const start = new Date();
    let end = null;
    try {
      const axiosOptions = {
        timeout: 60000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36",
        },
      };

      if (proxyAgent) {
        axiosOptions.httpsAgent = proxyAgent;
      }

      await axios.get(settings.api, axiosOptions);
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
