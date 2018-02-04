const assert = require('assert')
const formatNumber = require('format-num')

const defaultOptions = {
  format: '%v', // %s => symbol, %v => value, %c => code
  code: undefined,
  symbol: undefined,
  locale: 'en-US',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  nanZero: true
}

function formatCurrency (amount, opts) {
  opts = Object.assign({}, defaultOptions, opts)
  assert(opts.format.includes('%v'), 'Must have "%v" in `format` options.')

  amount = formatNumber(amount, opts)

  return opts.format.replace('%v', amount).replace('%s', opts.symbol).replace('%c', opts.code)
}

module.exports = formatCurrency
