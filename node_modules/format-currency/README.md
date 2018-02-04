format-currency
===============

[![NPM Package](https://img.shields.io/npm/v/format-currency.svg?style=flat-square)](https://www.npmjs.org/package/format-currency)
[![Build Status](https://img.shields.io/travis/ExodusMovement/format-currency.svg?branch=master&style=flat-square)](https://travis-ci.org/ExodusMovement/format-currency)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

`format-currency` is a JavaScript component to format numbers and strings to currency strings. Used in [Exodus Ethereum Wallet](http://www.exodus.io/).


Install
-------

    npm install --save format-currency


Notes
-----

- Must have a JavaScript environment with `Object.assign` and `Intl.NumberFormat`.
In Node.js, this is at least v4. You can install in older environments, you'll just
need to polyfill.


Usage
-----

### formatCurrency

**Signature:** `formatCurrency(value, [options])`

**Parameters:**

- `value`: Value to convert. Will pass through [parse-num](https://github.com/ExodusMovement/parse-num) first.
Will coerce anything to a number.
- `options`: *optional* `object` parameter to specify [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat).
Appending `Digits` is not necessary. You can also shorten `maximum` to `max` and `minimum` to `min`. Adds one more option `nanZero`, which when the number is
`NaN`, if it should be coerced to `0` - defaults to `true` i.e. `NaN => '0'`. Also available `code`, `symbol`, `format`.

**Returns:**

A `string` currency representation of the number.

**Example:**

```js
const formatCurrency = require('format-currency')

// default, no currency symbol or code
console.log(formatCurrency(10000000.15)) // => 10,000,000.15

// include the currency code 'USD'
let opts = { format: '%v %c', code: 'USD' }
console.log(formatCurrency(10000000.15, opts)) // => 10,000,000.15 USD

// now include the currency symbol
let opts = { format: '%s%v %c', code: 'USD', symbol: '$' }
console.log(formatCurrency(10000000.15, opts)) // => $10,000,000.15 USD

// use to reformat currency strings
let opts = { format: '%s%v', symbol: '$' }
console.log(formatCurrency('$10,000,000.15 USD', opts)) // => $10,000,000.15

// change locale
let opts = { format: '%s%v', symbol: '$', locale: 'de-DE' }
// in Node.js (English only, unless you compiled with other language support)
console.log(formatCurrency(10000000.15, opts)) // => $10,000,000.15
// in Electron (renderer) or browser (supports all locales)
console.log(formatCurrency(10000000.15, opts)) // => $10.000.000,15

// crypto currency (Bitcoin, Ethereum)
let opts = { format: '%v %c', code: 'BTC', maxFraction: 8 }
console.log(formatCurrency(1.123456789, opts)) // => 1.12345678 (notice only 8)
```

Related
-------
- [format-num](https://github.com/ExodusMovement/format-num): Format numbers / number strings to nice strings with grouping and decimal separators.
- [number-unit](https://github.com/ExodusMovement/number-unit): Numbers with units. Easily convert numbers to from different units.
- [parse-num](https://github.com/ExodusMovement/parse-num): Parse anything into a number. A dependency
of this library.


License
-------

MIT
