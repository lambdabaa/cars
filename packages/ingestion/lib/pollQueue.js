// @flow

const AWS = require('aws-sdk');
const debug = console.log.bind(console, '[ingestion]');
const defaults = require('./config');
const promisify = require('./promisify');
const serially = require('./serially');
const times = require('lodash/times');

const SQS = new AWS.SQS(Object.assign({apiVersion: '2012-11-05'}, defaults));
const getQueueUrl = promisify(SQS, 'getQueueUrl');
const deleteMessage = promisify(SQS, 'deleteMessage');
const receiveMessage = promisify(SQS, 'receiveMessage');

let queueUrl: string;

async function doGetQueueUrl(): Promise<string> {
  if (queueUrl) {
    return queueUrl;
  }

  const queue = await getQueueUrl({
    QueueName: 'CarsPendingCrawl',
    QueueOwnerAWSAccountId: '398236186119'
  });

  queueUrl = queue.QueueUrl;
  return queueUrl;
}

async function pollQueue(listener: Function): Promise<any> {
  const aUrl = await doGetQueueUrl();
  const chunks = await Promise.all(
    times(10, () => {
      return receiveMessage({
        QueueUrl: aUrl,
        MaxNumberOfMessages: 10
      });
    })
  );

  return await serially(
    chunks.map((chunk) => {
      debug(`Pulled ${chunk.Messages.length} messages!`);
      return function() {
        return Promise.all(
          chunk.Messages.map(async (message) => {
            try {
              const response = await listener(message);
              await deleteMessage({
                QueueUrl: aUrl,
                ReceiptHandle: message.ReceiptHandle
              });

              return response;
            } catch (error) {
              debug(error);
            }
          })
        );
      }
    })
  );
}

module.exports = pollQueue;
