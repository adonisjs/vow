'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

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
    constructor (headers) {
      super()
      this._headers = headers || {}
      this._cookieString = this._parseCookies()
      this._cookies = null
      this._plainCookies = null
    }

    /**
     * Add a new hook before request starts
     *
     * @method before
     * @static
     *
     * @param  {Function} fn
     *
     * @chainable
     */
    static before (fn) {
      this._hooks.before.push(fn)
      return this
    }

    /**
     * Add a new hook for after request completes
     *
     * @method after
     * @static
     *
     * @param  {Function} fn
     *
     * @chainable
     */
    static after (fn) {
      this._hooks.after.push(fn)
      return this
    }

    /**
     * Hydrate request constructor properties, macros
     * and getters
     *
     * @method hydrate
     * @static
     *
     * @return {void}
     */
    static hydrate () {
      super.hydrate()
      this._hooks = {
        before: [],
        after: []
      }
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
      const setCookieHeader = this._headers['set-cookie'] || []
      const cookies = cookieParser.filterExpired(setCookieHeader.map((cookie) => cookieParser.parse(cookie)))
      return cookies.map((cookie) => `${cookie.key}=${cookie.value}`).join(';')
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
      if (!this._plainCookies) {
        this._plainCookies = nodeCookie.parse({ headers: { cookie: this._cookieString } })
      }
      return this._plainCookies
    }

    /**
     * Execute request hooks in sequence
     *
     * @method exec
     *
     * @param  {String} event - Must be `before` or `after`
     *
     * @return {void}
     */
    async exec (event) {
      if (event !== 'before' && event !== 'after') {
        throw new Error(`${event} is not a valid hook event for vow response`)
      }

      const hooks = this.constructor._hooks[event]
      for (const hook of hooks) {
        await hook(this)
      }
    }
  }

  /**
   * Properties for macroable
   */
  Response._macros = {}
  Response._getters = {}

  /**
   * For hooks
   */
  Response._hooks = {
    before: [],
    after: []
  }

  /**
   * Reference to the Config provider
   */
  Response.Config = Config

  return Response
}
