// @flow

import {FetchResponse} from './types';

const AWS = require('aws-sdk');
const debug = console.log.bind(console, '[ingestion]');
const defaults = require('./config');
const jsdom = require('jsdom');
const promisify = require('./promisify');

const Lambda = new AWS.Lambda(
  Object.assign(
    {apiVersion: '2015-03-31'},
    defaults
  )
);

async function fetch(url: string, options: Object = {}): Promise<FetchResponse> {
  debug(`fetch ${url}`);
  const res = await promisify(Lambda, 'invoke')({
    FunctionName: 'fetch',
    Payload: JSON.stringify({url, options})
  });

  const {body} = JSON.parse(res.Payload);
  if (!body.includes('recaptcha')) {
    return res;
  }

  debug(`Caught recaptcha! Retry ${url}`);
  return await fetch(url, options);
}

async function html(url: string): Promise<any> {
  debug(`html ${url}`);
  const res = await fetch(url);
  const {body} = JSON.parse(res.Payload);
  if (res.status >= 400) {
    debug(`Bad status ${url} ${res.status}`);
    throw new Error(`${res.status} ${res.statusText}`);
  }

  return await new Promise((resolve: Function, reject: Function) => {
    jsdom.env(body, (err: ?Error, aWindow: Object) => {
      return err ? reject(err) : resolve(aWindow);
    });
  });
}

exports.fetch = fetch;
exports.html = html;
