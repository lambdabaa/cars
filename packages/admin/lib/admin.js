// @flow

const programs = {
  countCraigslistFields: require('./countCraigslistFields'),
  listCraigslistCars: require('./listCraigslistCars')
};

function main(): void {
  const [program, ...args] = process.argv.slice(2);
  programs[program](...args);
}

// $FlowFixMe
if (require.main === module) {
  main();
}
