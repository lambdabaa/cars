// @flow

const datastore = require('@carsnag/datastore');

function main(): void {
  const stream = datastore.craigslistCars.stream();

  stream.on('data', car => {
    console.log(JSON.stringify(car));
  });

  stream.on('end', () => {
    console.log('Done');
  });
}

module.exports = main;
