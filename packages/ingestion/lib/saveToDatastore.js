// @flow

const assert = require('assert');
const datastore = require('@carsnag/datastore');
const debug = console.log.bind(console, '[ingestion]');
const getCarDetails = require('./getCarDetails');
const pollQueue = require('./pollQueue');
const url = require('url');
const wrapCar = require('./wrapCar');

function getCraigslist(aUrl: string): string {
  const {host} = url.parse(aUrl);
  return host != null ? host.split('.')[0] : '';
}

async function handleMessage(message: Object): Promise<void> {
  const car = JSON.parse(message.Body);
  // Check to see if this car is in the database.
  const carKey = datastore.key(['CraigslistCar', car.pid]);
  const record = await datastore.get(carKey);
  if (record && record.data && record.data.pid) {
    return record.data;
  }

  const details = await getCarDetails(car);
  const craigslist = getCraigslist(car.host);
  const craigslistKey = datastore.key(['Craigslist', craigslist]);
  const carData = Object.assign(
    {craigslist, updatedAt: Date.now()},
    car,
    details || {}
  );

  await Promise.all([
    datastore.save({key: carKey, data: wrapCar(carData)}),
    datastore.save({key: craigslistKey, data: {}})
  ]);
}

function saveToDatastore(): void {
  pollQueue(handleMessage);
}

module.exports = saveToDatastore;
