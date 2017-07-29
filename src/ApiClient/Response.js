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
const nodeCookie = require('node-cookie')
const cookieParser = require('../../lib/cookieParser')

class Response {
  constructor (res, isError, assert) {
    this._assert = assert
    this._isError = isError
    this._res = res
    this._statusMessages = {
      404: 'Make sure to define the route'
    }
  }

  /**
   * Returns the cookie string by parsing all
   * the cookies and filtering expired
   * one's
   *
   * @method _getCookieString
   *
   * @return {String}
   *
   * @private
   */
  _getCookieString () {
    const setCookieHeader = this._res.headers['set-cookie']
    const cookies = cookieParser.filterExpired(setCookieHeader.map((cookie) => cookieParser.parse(cookie)))
    return cookies.map((cookie) => `${cookie.key}=${cookie.value}`).join(';')
  }

  /**
   * Returns response status
   *
   * @attribute status
   *
   * @return {Number}
   */
  get status () {
    return this._res.status
  }

  /**
   * Response header
   *
   * @attribute headers
   *
   * @return {Object}
   */
  get headers () {
    return this._res.headers
  }

  /**
   * Returns text body from response
   *
   * @attribute text
   *
   * @return {String}
   */
  get text () {
    return this._res.text
  }

  /**
   * Returns response body
   *
   * @attribute body
   *
   * @return {Mixed}
   */
  get body () {
    return this._res.body
  }

  /**
   * Returns an array of redirect urls
   *
   * @attribute redirects
   *
   * @return {Array}
   */
  get redirects () {
    return this._res.redirects
  }

  /**
   * Returns an object of parsed cookies
   *
   * @attribute cookies
   *
   * @return {Object}
   */
  get cookies () {
    const req = {
      headers: {
        cookie: this._getCookieString()
      }
    }
    return nodeCookie.parse(req, process.env.APP_KEY, true)
  }

  /**
   * Returns an object of plainCookie
   *
   * @attribute plainCookies
   *
   * @return {Object}
   */
  get plainCookies () {
    const req = {
      headers: {
        cookie: this._getCookieString()
      }
    }
    return nodeCookie.parse(req)
  }

  /**
   * Asserts the response status
   *
   * @method assertStatus
   *
   * @param  {Number}     expected
   *
   * @return {void}
   */
  assertStatus (expected) {
    const message = this._statusMessages[this.status] || ''
    this._assert.equal(this.status, expected, message)
  }

  /**
   * Asserts the response text
   *
   * @method assertText
   *
   * @param  {String}   expected
   *
   * @return {void}
   */
  assertText (expected) {
    this._assert.equal(this.text, expected)
  }

  /**
   * Asserts request body
   *
   * @method assertBody
   *
   * @param  {Mixed}   expected
   *
   * @return {void}
   */
  assertBody (expected) {
    try {
      this._assert.deepEqual(this.body, expected)
    } catch (error) {
      this._assert.equal(this.text, expected)
    }
  }

  /**
   * Asserts json payload against request body
   *
   * @method assertJSON
   *
   * @param  {Object}   expected
   *
   * @return {void}
   */
  assertJSON (expected) {
    this._assert.deepEqual(this.body, expected)
  }

  /**
   * Assert json subset
   *
   * @method assertJSONSubset
   *
   * @param  {Object}         expected
   *
   * @return {void}
   */
  assertJSONSubset (expected) {
    this._assert.containSubset(this.body, expected)
  }

  /**
   * Asset for error text on the body
   *
   * @method assertError
   *
   * @param  {String}    expected
   *
   * @return {void}
   */
  assertError (expected) {
    this.assertBody(expected)
  }

  /**
   * Asserts that request was redirected to a given
   * url
   *
   * @method assertRedirect
   *
   * @param  {String}       expectedUrl
   *
   * @return {void}
   */
  assertRedirect (expectedUrl) {
    const routes = this.redirects.map((url) => urlModule.parse(url).pathname)
    this._assert.include(routes, expectedUrl, `Request was not redirected to ${expectedUrl}`)
  }

  /**
   * Asserts the cookie value
   *
   * @method assertCookie
   *
   * @param  {String}     key
   * @param  {Mixed}     value
   *
   * @return {void}
   */
  assertCookie (key, value) {
    this._assert.equal(this.cookies[key], value)
  }

  /**
   * Asserts the plain cookie value
   *
   * @method assertPlainCookie
   *
   * @param  {String}          key
   * @param  {Mixed}          value
   *
   * @return {void}
   */
  assertPlainCookie (key, value) {
    this._assert.equal(this.plainCookies[key], value)
  }

  /**
   * Assert header value
   *
   * @method assertHeader
   *
   * @param  {String}     key
   * @param  {Mixed}     value
   *
   * @return {void}
   */
  assertHeader (key, value) {
    this._assert.equal(this.headers[key.toLowerCase()], value)
  }
}

module.exports = Response
