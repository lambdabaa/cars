@carsnag
========

### Navigating the monorepo

#### Prerequisites

- nodejs v4.3.2
- npm@3.10.10

*NOTE*: You can optionally use [envy](https://github.com/lambdabaa/envy) along
with the root `.envyrc` file to manage `node` and `npm` versions.

#### Dependencies

```
npm install
lerna bootstrap
```

#### Build

Running `make <-jN>` from the project root will apply all build-time
transformations to the codebase.

#### Test

`npm test`
