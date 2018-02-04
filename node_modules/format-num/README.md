format-num
==========

[![NPM Package](https://img.shields.io/npm/v/format-num.svg?style=flat-square)](https://www.npmjs.org/package/format-num)
[![Build Status](https://img.shields.io/travis/ExodusMovement/format-num.svg?branch=master&style=flat-square)](https://travis-ci.org/ExodusMovement/format-num)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

`format-num` is a JavaScript component to format numbers to strings. Used in [Exodus Ethereum Wallet](http://www.exodus.io/).


Install
-------

    npm install --save `format-num`


Notes
-----

- Must have a JavaScript environment with `Object.assign` and `Intl.NumberFormat`.
In Node.js, this is at least v4. You can install in older environments, you'll just
need to polyfill.


Usage
-----

### formatNum

**Signature:** `formatNum(value, [options])`

**Parameters:**

- `value`: Value to convert. Will pass through [parse-num](https://github.com/ExodusMovement/parse-num) first.
Will coerce anything to a number.
- `options`: *optional* `object` parameter to specify [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat).
Appending `Digits` is not necessary. You can also shorten `maximum` to `max` and `minimum` to `min`. Adds one more option `nanZero`, which when the number is
`NaN`, if it should be coerced to `0` - defaults to `true` i.e. `NaN => '0'`.


**Returns:**

The `string` representation of the number.

**Example:**

```js
const formatNum = require('format-num')

console.log(formatNum(10000000.15)) // => 10,000,000.15
console.log(formatNum('10000000.15')) // => 10,000,000.15

console.log(formatNum(0.0000000000044535, { maxSignificant: 2 })) // => 0.0000000000045
console.log(formatNum(0, { minFraction: 2, maxFraction: 2 }))  // => 0.00

console.log(formatNum(null)) // => 0
console.log(formatNum(null, { nanZero: false })) // => NaN
```


Related
-------

- [parse-num](https://github.com/ExodusMovement/parse-num): Parse anything into a number. A dependency
of this library.


License
-------

MIT
