export type Car = {
  datetime: string;
  hood: string;
  host: string;
  href: string;
  pid: number;
  price: string;
  tagline: string;
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
