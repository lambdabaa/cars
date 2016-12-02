// @flow

const {Readable} = require('stream');
const streamByKind = require('./streamByKind');

function stream(): Readable {
  return streamByKind('CraigslistCar');
}

exports.stream = stream;
