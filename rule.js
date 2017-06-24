const { parse: parseUrl } = require('url');
const fs = require('fs');
const path = require('path');
const co = require('co');

const { isRemote, isMatch, getRes, handleWinPath } = require('./util.js');

const getMatchProxyOption = (requestDetail, proxyConfig) => {
  for (const pattern in proxyConfig) {
    if (proxyConfig.hasOwnProperty(pattern) && isMatch(requestDetail.url, pattern)) {
      return {
        pattern,
        value: proxyConfig[pattern]
      }
    }
  }
}

/*
* get the url string exclude the pattern from the reqUrl
* @Param {String} reqUrl  the original request url
* @Param {String} exclude  the part that to be excluded, but the end (.*) pattern will be kept
*/
const getSubPathExcludePattern = (reqUrl, exclude) => {
  const match = reqUrl.match(exclude);
  return match && match[1] || '';
}

const getMockResponse = function * (requestDetail, matchedProxy) {
  return new Promise((resolve, reject) => {
    const callback = (status, header, responseData) => {
      console.info('==> resolve in mock response, ', responseData);
      resolve({
        statusCode: status,
        header,
        body: responseData
      });
    }

    if (!matchedProxy) {
      return resolve(null);
    }

    const { value: proxyOption } = matchedProxy;

    if (typeof proxyOption === 'function') {
      proxyOption(requestDetail, getRes(requestDetail, callback));
    }

    // Handle with local file
    if (typeof proxyOption === 'string' && !isRemote(proxyOption)) {
      getRes(requestDetail, callback).end(fs.readFileSync(proxyOption), 'utf-8');
    }
  });
}

/**
* if the mapped proxy is set to do inverse proxy
*/
const handleInverseProxy = (requestDetail, proxyTarget) => {
  const { value: targetUrl, pattern } = proxyTarget;
  const options = requestDetail.requestOptions;

  const excludeSubPath = getSubPathExcludePattern(requestDetail.url, pattern);
  const { hostname, port, path: targetPath, protocol } = parseUrl(targetUrl);
  options.hostname = hostname;
  requestDetail.protocol = protocol;

  if (port) {
    options.port = port;
  }

  const finalPath = handleWinPath(path.join(targetPath, excludeSubPath));

  options.path = finalPath;
};

module.exports = {
  *loadConfig(config) {
    this.config = config;
  },
  *beforeSendRequest(requestDetail = {}) {
    return new Promise((resolve, reject) => {
      const matchedProxy = getMatchProxyOption(requestDetail, this.config);
      // if there is no matched proxy option, do nothing here
      if (!matchedProxy) {
        resolve(requestDetail);
      }
      if (isRemote(matchedProxy.value)) {
        handleInverseProxy(requestDetail, matchedProxy);
        resolve(requestDetail);
      } else {
        // TODO local mock handler
        co(function * () {
          return yield getMockResponse(requestDetail, matchedProxy);
        })
        .then((response) => {
          requestDetail.response = response;
          resolve(requestDetail);
        })
        .catch(() => {
          resolve(requestDetail);
        })
      }
    })
  }
};
