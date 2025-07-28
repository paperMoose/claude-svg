# font-family [![Build Status](https://travis-ci.org/hanamura/font-family.svg?branch=master)](https://travis-ci.org/hanamura/font-family)

CSS font-family parser/stringifier.

## Installation

```sh
npm install font-family
```

## Example

```javascript
var parse = require('font-family').parse;

parse('"Helvetica Neue", Helvetica, sans-serif');
// => [ 'Helvetica Neue', 'Helvetica', 'sans-serif' ]
```

```javascript
var stringify = require('font-family').stringify;

stringify(['Helvetica Neue', 'Helvetica', 'sans-serif']);
// => '"Helvetica Neue", Helvetica, sans-serif'
```

## License

MIT
