// TODO: Flow is complaining about url.format(url.parse(...))

const AWS = require('aws-sdk');
const assert = require('assert');
const debug = console.log.bind(console, '[ingestion]');
const defaults = require('./config');
const promisify = require('./promisify');
const request = require('./request');
const url = require('url');

const SQS = new AWS.SQS(Object.assign({apiVersion: '2012-11-05'}, defaults));

function listPageCraigslists(aWindow: Object): Array<string> {
  return Array.from(
    aWindow
      .document
      .getElementById('list')
      .getElementsByTagName('a')
  )
  .map((element: HTMLAnchorElement) => {
    return url.format(
      Object.assign(
        url.parse(element.href),
        {protocol: 'https'}
      )
    );
  })
}

async function listCraigslists(event: Object): Promise<void> {
  const aWindow = await request.html('https://geo.craigslist.org/iso/us');

  const data = await promisify(SQS, 'getQueueUrl')({
    QueueName: 'CraigslistsPendingCrawl',
    QueueOwnerAWSAccountId: '398236186119'
  });

  await Promise.all(
    listPageCraigslists(aWindow).map((craigslist: string): Promise<void> => {
      return promisify(SQS, 'sendMessage')({
        QueueUrl: data.QueueUrl,
        MessageBody: craigslist
      });
    })
  );
}

module.exports = listCraigslists;
