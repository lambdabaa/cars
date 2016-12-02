const AWS = require('aws-sdk');
const debug = console.log.bind(console, '[carsnag/craigslist/listCraigslists]');
const defaults = require('./config');
const promisify = require('./promisify');
const request = require('./request');
const url = require('url');

function listCraigslists(event: Object) {
  // TODO
}

module.exports = listCraigslists;
