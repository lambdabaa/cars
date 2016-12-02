// @flow

const stream = require('stream');

function drain(input: stream.Readable): Promise<Array<any>> {
  let result = [];

  input.on('data', (data: any) => {
    result.push(data);
  });

  return new Promise((resolve: Function) => {
    input.on('end', () => {
      resolve(result);
    });
  });
}

module.exports = drain;
