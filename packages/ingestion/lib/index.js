// @flow

require('babel-polyfill');

const fetch = require('./fetch');
const listCars = require('./listCars');
const listCraigslists = require('./listCraigslists');
const queueManager = require('./queueManager');
const saveToDatastore = require('./saveToDatastore');

type Context = {
  functionName: 'fetch' | 'listCars' | 'listCraigslists' | 'queueManager' | 'saveToDatastore';
};

function resolveFunction(context: Context): Function {
  switch (context.functionName) {
    case 'fetch':
      return fetch;
    case 'listCars':
      return listCars;
    case 'listCraigslists':
      return listCraigslists;
    case 'queueManager':
      return queueManager;
    case 'saveToDatastore':
      return saveToDatastore;
  }

  throw new Error(`Unknown function ${context.functionName}`);
}

function handler(event: Object, context: Context, callback: Function): void {
  resolveFunction(context)(event)
  .then((res: any) => {
    callback(null, res);
  })
  .catch(callback);
}

exports.handler = handler;
