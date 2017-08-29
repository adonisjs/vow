'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')

const cookieParser = exports = module.exports = {}

cookieParser.parse = function (cookie) {
  const cookiePairs = _.compact(cookie.split(';'))
  const meta = _.transform(_.tail(cookiePairs), (result, pairs) => {
    const [key, value] = pairs.split('=')
    result[key.trim().toLowerCase()] = typeof (value) === 'string' ? value.trim() : value
    return result
  }, {})

  const [key, value] = _.first(cookiePairs).split('=')
  return { key: key.trim(), value: value.trim(), meta }
}

cookieParser.filterExpired = function (cookies) {
  return cookies.filter((cookie) => {
    if (!cookie.meta.expires) {
      return true
    }
    return new Date().getTime() < new Date(cookie.meta.expires).getTime()
  })
}
