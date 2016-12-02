// TODO: Flow is currently complaining about objectMode streams...

const debug = console.log.bind(console, '[carsnag/craigslist/listCars]');
const dom = require('./dom');
const drain = require('./drain');
const request = require('./request');
const stream = require('stream');
const url = require('url');

type Car = {
  datetime: string;
  hood: string;
  host: string;
  href: string;
  pid: number;
  price: string;
  tagline: string;
};

type ListCarsResponse = {
  cars: Array<Car>;
};

class CarStream extends stream.Readable {
  craigslist: string;
  offset: number;

  constructor(craigslist) {
    super({objectMode: true});
    this.craigslist = craigslist;
    this.offset = 0;
  }

  async _read(): Promise<void> {
    const target = url.resolve(this.craigslist, `/search/cta?s=${this.offset}`);
    debug(`GET ${target}`);
    const aWindow = await request.html(target);
    if (!aWindow) {
      throw new Error(`Missing ${target}`);
    }

    const {doc} = aWindow.document;
    const element = doc.querySelector('.pagenum');
    const page = element.textContent;
    // ie 1 to 100 of 1000
    if (!/\d+\sto\s(\d+)\sof\s(\d+)/.test(page)) {
      this.push(null);
      return;
    }

    // $FlowFixMe
    this.offset = +RegExp.$1;

    Array
      .from(doc.querySelectorAll('.result-row'))
      .map(serializeCarElement)
      .forEach((car: Car) => this.push(car));
  }
}

function serializeCarElement(car: HTMLElement): Car {
  const image = car.querySelector('.result-image');
  const href = image.getAttribute('href');
  const date = car.querySelector('.result-date');
  const datetime = date.getAttribute('datetime');
  const tagline = dom.getTextContent(car, '.result-title');
  const price = dom.getTextContent(car, '.result-price');
  const hood = dom.getTextContent(car, '.result-hood');
  const pid = +car.getAttribute('data-pid');

  return {
    host: craigslist,
    pid,
    href,
    datetime,
    tagline,
    price,
    hood
  };
}

async function listCars(event: Object): Promise<ListCarsResponse> {
  const stream = new CarStream(event.target);
  const cars = await drain(stream);
  return callback(null, {cars});
}

module.exports = listCars;
