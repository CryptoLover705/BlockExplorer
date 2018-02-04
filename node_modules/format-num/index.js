const parseNum = require('parse-num')

/* global Intl */

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
const defaultOptions = {
  nanZero: true,
  locale: 'en-US',
  localeMatcher: 'best fit',
  useGrouping: true, // grouping separator determined by locale
  maximumFractionDigits: 15
  // OTHER
  // minimumIntegerDigits
  // minimumFractionDigits
  // maximumFractionDigits
  // minimumSignificantDigits
  // maximumSignificantDigits
}

function formatNum (number, opts) {
  opts = renameKeyShortcuts(Object.assign({}, defaultOptions, opts))
  number = parseNum(number)

  if (isNaN(number)) {
    if (opts.nanZero === false) return 'NaN'
    else number = 0
  }

  const nf = new Intl.NumberFormat([opts.locale], Object.assign({}, opts, { style: 'decimal' }))
  return nf.format(number)
}

function renameKeyShortcuts (opts) {
  // expand 'min' to 'minimum', 'max' to 'maximum'
  Object.keys(opts).forEach(function (key) {
    if (!key.includes('minimum') && key.startsWith('min')) {
      opts[key.replace('min', 'minimum')] = opts[key]
      delete opts[key]
    }

    if (!key.includes('maximum') && key.startsWith('max')) {
      opts[key.replace('max', 'maximum')] = opts[key]
      delete opts[key]
    }
  })

  Object.keys(opts).forEach(function (key) {
    if (key.startsWith('minimum') && !key.endsWith('Digits')) {
      opts[key + 'Digits'] = opts[key]
      delete opts[key]
    }

    if (key.startsWith('maximum') && !key.endsWith('Digits')) {
      opts[key + 'Digits'] = opts[key]
      delete opts[key]
    }
  })

  return opts
}

module.exports = formatNum
