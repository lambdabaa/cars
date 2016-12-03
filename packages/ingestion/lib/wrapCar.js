// @flow

const datastore = require('@carsnag/datastore');
const debug = console.log.bind(console, '[ingestion]');

type DatastoreEntity = {
  name: string;
  value: string | number;
  excludeFromIndexes: boolean;
};

function wrapCar(obj: Object): Array<DatastoreEntity> {
  let result = [];
  for (let key in obj) {
    if (obj[key] === undefined) {
      continue;
    }

    let value = obj[key];
    if (value != null) {
      switch (key) {
        case 'hood':
          if (typeof value === 'string') {
            value = value.replace(/\(/g, '').replace(/\)/g, '');
            debug(`Hood: ${value}`);
          }

          break;
        case 'location':
          if (value.lat && value.lon) {
            value = datastore.geoPoint({
              latitude: value.lat,
              longitude: value.lon
            });
            debug(`Location: ${JSON.stringify(value)}`);
          }

          break;
        case 'price':
          if (typeof value === 'string') {
            value = +value.replace('$', '');
            debug(`Price: ${value}`);
          }

          break;
      }
    }

    result.push({
      name: key,
      value,
      excludeFromIndexes: !isIndexed(key)
    });
  }

  return result;
}

function isIndexed(key: string): boolean {
  switch (key) {
    case 'condition':
    case 'craigslist':
    case 'cylinders':
    case 'datetime':
    case 'drive':
    case 'fuel':
    case 'hood':
    case 'location':
    case 'odometer':
    case 'paint color':
    case 'pid':
    case 'price':
    case 'tagline':
    case 'title status':
    case 'type':
    case 'updatedAt':
      return true;
  }

  return false;
}

module.exports = wrapCar;
