// @flow

const datastore = require('./datastore');
const stream = require('stream');

require('babel-polyfill');

class KindStream extends stream.Readable {
  kind: string;
  cursor: ?number;

  constructor(kind: string) {
    super({objectMode: true});

    this.kind = kind;
    this.cursor = null;
  }

  async _read(): Promise<void> {
    const query = datastore
      .createQuery(this.kind)
      .limit(100)
      .start(this.cursor);

    const [entities, info] = await datastore.runQuery(query);
    entities.forEach((entity: Object): void => {
      this.push(entity);
    });

    if (info.moreResults === datastore.NO_MORE_RESULTS) {
      this.push(null);;
      return;
    }

    this.cursor = info.endCursor;
  }
}

function streamByKind(kind: string): stream.Readable {
  return new KindStream(kind);
}

module.exports = streamByKind;
