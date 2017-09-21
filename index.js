'use strict';

const https = require('https');
const Gist = {};
const fs = require('fs-extra');
const path = require('path');

Gist.get = function get(id) {
  return new Promise((resolve, reject) => {
    console.log(`downloading: https://api.github.com/gists/${id}`);
    https.get({
      host: 'api.github.com',
      path: `/gists/${id}`,
      method: 'GET',
      headers: {
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', reason => reject(reason));
    });
  });
}

Gist.get(process.argv[2]).then(x => {
  Object.keys(x.files).forEach(name => {
    if (name === 'twiddle.json') {
      return;
    }
    let { filename, content }= x.files[name];
    let splits = filename.split('.');
    let extension = splits.pop();
    splits.unshift('app');
    let localPath = splits.join('/') + '.' + extension;

    console.log('    writing', localPath);
    fs.mkdirpSync(path.dirname(localPath));
    fs.writeFileSync(localPath, content);
  })
});
