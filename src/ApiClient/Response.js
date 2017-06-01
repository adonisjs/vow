'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const urlModule = require('url')

class Response {
  constructor (resOrError, assert) {
    this._assert = assert
    this._isError = resOrError.name === 'Error'
    this._res = this._isError ? resOrError.response : resOrError
  }

  get status () {
    return this._res.status
  }

  get text () {
    return this._res.text
  }

  get body () {
    return this._res.body
  }

  get redirects () {
    return this._res.redirects
  }

  assertStatus (expected) {
    this._assert.equal(this.status, expected)
  }

  assertText (expected) {
    this._assert.equal(this.text, expected)
  }

  assertBody (expected) {
    try {
      this._assert.deepEqual(this.body, expected)
    } catch (error) {
      this._assert.equal(this.text, expected)
    }
  }

  assertJSON (expected) {
    this._assert.deepEqual(this.body, expected)
  }

  assertError (expected) {
    this.assertBody(expected)
  }

  assertRedirect (expectedUrl) {
    const routes = this.redirects.map((url) => urlModule.parse(url).pathname)
    this._assert.include(routes, expectedUrl, `Request was not redirected to ${expectedUrl}`)
  }
}

module.exports = Response
