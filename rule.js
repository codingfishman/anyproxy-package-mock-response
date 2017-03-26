const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

/**
* get the url mapped local file from the configuration
*/

function * _getMappedLocalFileFromConfig (requestUrl, config = {}) {
  return new Promise ((resolve) => {
    const list = config.list;
    if (!config.list) {
      return resolve(null);
    }

    let targetFilePath = null;
    const configLength = list.length;
    for (let i = 0; i < configLength; i++ ) {
      const { url, file} = list[i];

      if (!url) {
        continue;
      }

      if (requestUrl.indexOf(url) > -1) {
        targetFilePath = file;
        break;
      }
    }

    if (!targetFilePath) {
      resolve(null);
    } else {
      fs.readFile(targetFilePath, (error, data) => {
        if (error) {
          throw new Error(error);
        }

        resolve({
          statusCode: 200,
          header: {
            'Content-Type': mime.contentType(path.extname(targetFilePath))
          },
          body: data
        });
      })
    }
  })

}

module.exports = {
  summary: 'A rule to map local to url',
  loadConfig: function* (config) {
    this.config = config;
  },

  *beforeSendRequest(requestDetail = {}) {
    const { url } = requestDetail;
    const response = yield _getMappedLocalFileFromConfig(url, this.config);
    requestDetail.response = response;
    return requestDetail;
  },
};