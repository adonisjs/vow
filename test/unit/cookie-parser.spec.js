'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const cookieParser = require('../../lib/cookieParser')

test.group('Cookie Parser', () => {
  test('parse cookie string into key/value pairs', (assert) => {
    const hash = cookieParser.parse('foo=bar')
    assert.deepEqual(hash, { key: 'foo', value: 'bar', meta: {} })
  })

  test('parse cookie string with meta data into key/value pairs', (assert) => {
    const hash = cookieParser.parse('foo=bar; path=/')
    assert.deepEqual(hash, { key: 'foo', value: 'bar', meta: { path: '/' } })
  })

  test('parse cookie string with meta data into key/value pairs when value is empty', (assert) => {
    const hash = cookieParser.parse('foo=; path=/')
    assert.deepEqual(hash, { key: 'foo', value: '', meta: { path: '/' } })
  })

  test('filter expired cookies', (assert) => {
    const hash = cookieParser.filterExpired([cookieParser.parse('foo=bar; Expires=Thu, 09 Jan 1990 00:00:00')])
    assert.deepEqual(hash, [])
  })

  test('return cookies to be expired in future', (assert) => {
    const hash = cookieParser.filterExpired([cookieParser.parse('foo=bar; Expires=Thu, 20 Jan 2020 00:00:00')])
    assert.deepEqual(hash, [{ key: 'foo', value: 'bar', meta: { expires: 'Thu, 20 Jan 2020 00:00:00' } }])
  })
})
