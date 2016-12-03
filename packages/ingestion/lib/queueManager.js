// @flow

import type {Car} from './types';

const AWS = require('aws-sdk');
const assert = require('assert');
const datastore = require('@carsnag/datastore');
const debug = console.log.bind(console, '[ingestion]');
const defaults = require('./config');
const promisify = require('./promisify');

const Lambda = new AWS.Lambda(Object.assign({apiVersion: '2015-03-31'}, defaults));
const SQS = new AWS.SQS(Object.assign({apiVersion: '2012-11-05'}, defaults));

async function filterPreviouslySeen(cars: Array<Car>): Promise<Array<Car>> {
  const results = await Promise.all(
    cars.map(async (car: Car) => {
      const key = datastore.key(['CraigslistCar', car.pid]);
      const record = await datastore.get(key);
      return {car, record};
    })
  );

  return results
    .filter((result) => {
      const {record} = result;
      return !record || !record.data || !record.data.pid;
    })
    .map((result) => result.car);
}

async function queuePipe(input: string, output: string): Promise<void> {
  const msg = await promisify(SQS, 'receiveMessage')({QueueUrl: input});
  assert.ok(msg.Messages && msg.Messages.length);
  const target = msg.Messages[0].Body;
  const receipt = msg.Messages[0].ReceiptHandle;
  const res = await promisify(SQS, 'invoke')({
    FunctionName: 'listCars',
    Payload: JSON.stringify({target})
  });

  const cars: Array<Car> = JSON.parse(res.Payload);
  const crawlable = await filterPreviouslySeen(cars);
  await Promise.all(
    crawlable.map(car => {
      return promisify(SQS, 'sendMessage')({
        QueueUrl: output,
        MessageBody: JSON.stringify(car)
      });
    })
  );
}

async function queueManager(): Promise<void> {
  const getQueueUrl = promisify(SQS, 'getQueueUrl');
  const queues = await Promise.all([
    getQueueUrl({
      QueueName: 'CraigslistsPendingCrawl',
      QueueOwnerAWSAccountId: '398236186119'
    }),
    getQueueUrl({
      QueueName: 'CarsPendingCrawl',
      QueueOwnerAWSAccountId: '398236186119'
    })
  ]);

  await queuePipe(...queues);
}

module.exports = queueManager;
