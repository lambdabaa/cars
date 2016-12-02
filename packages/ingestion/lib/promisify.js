// @flow

const impl = require('bluebird').promisify;

function promisify(parent: Object, key: string): Function {
  return impl(parent[key], {context: parent});
}

module.exports = promisify;
