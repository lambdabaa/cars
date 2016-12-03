// @flow

import type {Car, CarDetails} from './types';

const datastore = require('@carsnag/datastore');
const debug = console.log.bind(console, '[ingestion]');
const dom = require('./dom');
const jsdom = require('jsdom');
const request = require('./request');
const url = require('url');

function getCarDetails(meta: Car): ?CarDetails {
  const host = meta.host;
  const href = meta.href;
  const target = url.resolve(host, href);
  return request.html(target).then(aWindow => {
    const doc = aWindow.document;
    if (doc.title.includes('Page Not Found')) {
      debug(`Page ${target} not found!`);
      return {};
    }

    if (doc.getElementById('has_been_removed')) {
      debug(`Page ${target} has been removed!`);
      return {};
    }

    if (doc.body.textContent.includes('This IP has been automatically blocked')) {
      return Promise.reject(new Error('Blocked IP'));
    }

    let tagline;
    try {
      tagline = getTitle(doc);
    } catch (error) {
      tagline = null;
    }

    let body;
    try {
      body = getBody(doc);
    } catch (error) {
      body = null;
    }

    if (!body) {
      return Promise.reject(new Error('Body missing!'));
    }

    let images;
    try {
      images = getImages(doc);
    } catch (error) {
      images = null;
    }

    let location;
    try {
      location = getLocation(doc);
    } catch (error) {
      location = null;
    }

    let price;
    try {
      price = getPrice(doc);
    } catch (error) {
      price = null;
    }

    let details;
    try {
      details = getDetails(doc);
    } catch (error) {
      details = null;
    }

    return Object.assign(
      {},
      details || {},
      {
        tagline,
        price,
        images,
        location,
        body,
        url: target
      }
    );
  })
  .catch(error => {
    debug(error);
    return null;
  });
}

function getTitle(doc: HTMLElement): ?string {
  return dom.getTextContent(doc, '#titletextonly');
}

function getPrice(doc: HTMLElement): ?string {
  const price = dom.getTextContent(doc, '.price');
  if (!price) {
    return null;
  }

  const match = /\d+/.exec(price);
  // $FlowFixMe
  return match ? +match[0] : price;
}

function getImages(doc: HTMLElement): Array<string> {
  if (doc.querySelector('#thumbs')) {
    return Array
      .from(doc.querySelector('#thumbs').getElementsByTagName('a'))
      .map(thumb => thumb.href);
  }

  const swipe = doc.querySelector('.swipe');
  if (!swipe) {
    return [];
  }

  const img = ((swipe.querySelector('img'): any): HTMLImageElement);
  if (!img) {
    return [];
  }

  return [img.src];
}

function getLocation(doc: HTMLElement): ?Object {
  const map = doc.querySelector('#map');
  if (!map) {
    return null;
  }

  return datastore.geoPoint({
    latitude: +map.getAttribute('data-latitude'),
    longitude: +map.getAttribute('data-longitude')
  });
}

function getDetails(doc: HTMLElement): Object {
  const groups = Array.from(doc.getElementsByClassName('attrgroup'));
  if (!groups.length) {
    return {};
  }

  const detailsGroup = groups[groups.length - 1];
  let result = getGroupDetails(detailsGroup);
  const meta = groups[0].textContent;
  if (meta) {
    result.meta = meta.trim();
  }

  return result;
}

function getGroupDetails(parent: HTMLElement): Object {
  return Array
    .from(parent.getElementsByTagName('span'))
    .reduce((result, container) => {
      const children = container.childNodes;
      const key = children[0].textContent.split(':')[0];
      const value = children[1].textContent;
      return Object.assign({[key]: value}, result);
    }, {});
}

function getBody(doc: HTMLElement): ?string {
  const result = dom.getTextContent(doc, '#postingbody')
  return result != null ? result.trim() : null;
}

module.exports = getCarDetails;
