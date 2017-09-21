const { parse: parseUrl } = require('url');
const isPlainObject = require('is-plain-object');
const mime = require('mime-types');

function decodeParam(val) {
  if (typeof val !== 'string' || val.length === 0) {
    return val;
  }

  return decodeURIComponent(val);
}

function isRemote(str) {
  return typeof str === 'string'
    && (str.indexOf('http://') === 0 || str.indexOf('https://') === 0);
}

function getExpects(pattern) {
  const expect = {};
  if (pattern.indexOf(' ') > -1) {
    [expect.expectMethod, expect.expectPattern] = pattern.split(/\s+/);
  } else {
    expect.expectPattern = pattern;
  }

  return expect;
}

function isMatch(url, pattern) {
  const urlObj = parseUrl(url);
  const { expectPattern } = getExpects(pattern);

  if (isRemote(expectPattern)) {
    const { hostname, port, path } = parseUrl(expectPattern);
    return hostname === urlObj.hostname
      && (port || '80') === (urlObj.port || '80')
      && !!urlObj.path.match(new RegExp(path));
  }

  return !!urlObj.pathname.match(new RegExp(expectPattern));
}

function getRes(req, callback) {
  let status = 200;
  let headers = {
    'access-control-allow-origin': '*',
  };

  function normalizeData(data) {
    switch (typeof data) {
      case 'string':
        return data;
      case 'function':
        return data();
      default:
        return JSON.stringify(data);
    }
  }

  return {
    type(type) {
      return this.set('Content-Type', mime.lookup(type));
    },
    set(key, val) {
      if (isPlainObject(key)) {
        headers = Object.assign({}, headers, key);
      } else {
        headers[key] = val;
      }
      return this;
    },
    status(statusCode) {
      status = statusCode;
      return this;
    },
    json(data) {
      return this.type('json').end(JSON.stringify(data));
    },
    jsonp(data, callbackName) {
      if (!req.query || (req.query[callbackName || 'callback'] === undefined)) {
        return this.type('json').status(400)
          .end({
            errors: [{
              status: 400,
              detail: 'Should provide a callback for JSONP',
            }],
          });
      }

      const fn = req.query[callbackName || 'callback'];
      return this.type('json').end(`${fn}(${JSON.stringify(data)})`);
    },
    end(data) {
      console.info('===> end with status', status);
      callback(status, headers, normalizeData(data));
      return this;
    },
  };
}

function handleWinPath(url) {
  return url.replace(/\\/g, '/');
}

module.exports = {
  decodeParam,
  isRemote,
  getExpects,
  isMatch,
  getRes,
  handleWinPath
};
