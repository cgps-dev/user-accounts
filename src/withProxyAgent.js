module.exports = function (strategy) {
  if (process.env.https_proxy) {
    const HttpsProxyAgent = require("https-proxy-agent");
    const httpsProxyAgent = new HttpsProxyAgent(process.env.https_proxy);
    strategy._oauth2.setAgent(httpsProxyAgent);
  }
  return strategy;
};
