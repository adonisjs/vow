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
const Macroable = require('macroable')
const debug = require('debug')('adonis:vow')
const nodeCookie = require('node-cookie')
const cookieParser = require('../../lib/cookieParser')

module.exports = function (Config) {
  debug('creating isolated response for the suite')

  /**
   * This is base response class to be used
   * by other response clients. For example:
   * Api client and browser client.
   *
   * @class BaseResponse
   * @constructor
   */
  class Response extends Macroable {
    constructor (assert, headers) {
      super()
      this._assert = assert
      this.updateHeaders(headers)
    }

    /**
     * Parses the headers cookie into a string. This
     * method will remove expired cookies
     *
     * @method _parseCookies
     *
     * @return {String}
     *
     * @private
     */
    _parseCookies () {
      const setCookieHeader = this.headers['set-cookie'] || []
      const cookies = cookieParser.filterExpired(setCookieHeader.map((cookie) => cookieParser.parse(cookie)))
      return cookies.map((cookie) => `${cookie.key}=${cookie.value}`).join(';')
    }

    /**
     * Update response headers and re-evaluate cookies
     *
     * @method updateHeaders
     *
     * @param  {Object}      headers
     *
     * @return {void}
     */
    updateHeaders (headers) {
      this.headers = headers || {}
      this._cookieString = this._parseCookies()
      this._cookies = null
      this._plainCookies = null
    }

    /**
     * A object of response cookies
     *
     * @attribute cookies
     *
     * @return {Object}
     */
    get cookies () {
      const appKey = this.constructor.Config.get('app.appKey')
      /* istanbul ignore else */
      if (!this._cookies) {
        this._cookies = nodeCookie.parse({ headers: { cookie: this._cookieString } }, appKey, !!appKey)
      }
      return this._cookies
    }

    /**
     * A object of response plain cookies
     *
     * @attribute cookies
     *
     * @return {Object}
     */
    get plainCookies () {
      /* istanbul ignore else */
      if (!this._plainCookies) {
        this._plainCookies = nodeCookie.parse({ headers: { cookie: this._cookieString } })
      }
      return this._plainCookies
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
      this._assert.equal(this.status, expected)
      return this
    }

    /**
     * Asserts the response contains something
     *
     * @method assertTextHas
     *
     * @param  {String}   expected
     *
     * @return {void}
     */
    assertTextHas (expected) {
      this._assert.include(this.text, expected)
      return this
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
      return this
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
      return this
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
      return this
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
      return this
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
      return this
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
      return this
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
      return this
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
      return this
    }

    /**
     * Asserts the cookie exists.
     *
     * @method assertCookieExists
     *
     * @param  {String}     key
     *
     * @return {this}
     */
    assertCookieExists (key) {
      this._assert.exists(this.cookies[key])
      return this
    }

    /**
     * Asserts the plain cookie exists
     *
     * @method assertPlainCookieExists
     *
     * @param  {String}          key
     *
     * @return {this}
     */
    assertPlainCookieExists (key) {
      this._assert.exists(this.plainCookies[key])
      return this
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
      return this
    }
  }

  /**
   * Properties for macroable
   */
  Response._macros = {}
  Response._getters = {}

  /**
   * Reference to the Config provider
   */
  Response.Config = Config

  return Response
}
