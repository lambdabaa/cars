// TODO: Flow is currently complaining about objectMode streams...
import type {Dictionary} from '../../../lib/types';

const datastore = require('@carsnag/datastore');
const forEach = require('lodash/forEach');
const reduce = require('lodash/reduce');
const stream = require('stream');

class CountFields extends stream.Transform {
  counts: Dictionary<string, number>;

  constructor() {
    super({objectMode: true});

    this.counts = {};
  }

  _transform(obj: Object, encoding: string, callback: Function): void {
    const incremental: Dictionary<string, number> = reduce(
      obj,
      (result: Dictionary<string, number>, val: any, key: string): Dictionary<string, number> => {
        if (val == null) {
          return result;
        }

        return Object.assign({[key]: 1}, result);
      },
      {total: 1}
    );

    forEach(incremental, (val: number, key: string): void => {
      this.counts[key] = this.counts[key] ?
        this.counts[key] + val :
        val;
    });

    callback(null, this.counts);
  }
}

function main(): void {
  const input = datastore
    .craigslistCars
    .stream()
    .pipe(new CountFields());

  input.on('data', (data: Dictionary<string, number>) => {
    console.log(JSON.stringify(data));
  });
}

module.exports = main;
