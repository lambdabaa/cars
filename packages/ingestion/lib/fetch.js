// @flow

import {FetchResponse} from './types';

const fetch = require('node-fetch');

async function impl(event: Object): Promise<FetchResponse> {
  const {url} = event.url;
  const options = event.options || {};
  const res = await fetch(url, options);
  const text = await res.text();
  return {
    url: res.url,
    status: res.status,
    statusText: res.statusText,
    body: text
  };
}

module.exports = impl;
