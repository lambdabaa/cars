export type Car = {
  datetime: string;
  hood: string;
  host: string;
  href: string;
  pid: number;
  price: string;
  tagline: string;
};

export type CarDetails = {
  body: string;
  images: Array<string>;
  location: string;
  price: number;
  tagline: string;
  url: string;
  details: Object;
};

export type FetchResponse = {
  body: string;
  status: number;
  statusText: string;
  url: string;
};

export type ListCarsResponse = {
  cars: Array<Car>;
};
