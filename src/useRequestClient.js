const oauth = require("oauth");
const request = require("request");

oauth.OAuth2.prototype._executeRequest = function (_, options, body, callback) {
  const { host, path, headers, method } = options;
  request[method.toLowerCase()]({
    uri: `https://${host}${path}`,
    headers,
    body,
  }, (err, response, data) => {
    if (err) {
      callback(err);
    } else if (!(response.statusCode >= 200 && response.statusCode <= 299) && (response.statusCode !== 301) && (response.statusCode !== 302)) {
      callback({ statusCode: response.statusCode, data });
    } else {
      callback(null, data, response);
    }
  });
};

oauth.OAuth.prototype._createClient = function (port, host, method, path, headers) {
  return request[method.toLowerCase()]({
    uri: `https://${host}:${port}${path}`,
    headers,
  });
};
