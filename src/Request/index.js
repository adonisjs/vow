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
const nodeCookie = require('node-cookie')
const debug = require('debug')('adonis:vow')

module.exports = function (Config) {
  debug('creating isolated request for the suite')

  /**
   * This is base request class to be used
   * by other request clients. For example:
   * Api client and browser client.
   *
   * @class BaseRequest
   * @constructor
   */
  class Request extends Macroable {
    constructor () {
      super()
      this._cookies = []
      this._headers = []
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
     * An array of cookies to be
     * set as header
     *
     * @attribute cookies
     *
     * @return {Array}
     */
    get cookies () {
      return this._cookies
    }

    /**
     * Array of request headers
     *
     * @attribute headers
     *
     * @return {Array}
     */
    get headers () {
      return this._headers
    }

    /**
     * Add a cookie to the request
     *
     * @method cookie
     *
     * @param  {String} key
     * @param  {Mixed} value
     *
     * @chainable
     */
    cookie (key, value) {
      const appKey = this.constructor.Config.get('app.appKey')
      value = nodeCookie.packValue(value, appKey, !!appKey)
      this._cookies.push({ key, value })
      return this
    }

    /**
     * Adds a plain cookie to the cookie store
     *
     * @method plainCookie
     *
     * @param  {String}    key
     * @param  {Mixed}     value
     *
     * @chainable
     */
    plainCookie (key, value) {
      this._cookies.push({ key, value: nodeCookie.packValue(value) })
      return this
    }

    /**
     * Set request header/headers
     *
     * @method header
     *
     * @param  {String} key
     * @param  {Object} value
     *
     * @chainable
     */
    header (key, value) {
      this._headers.push({ key, value })
      return this
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
        throw new Error(`${event} is not a valid hook event for vow request`)
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
  Request._macros = {}
  Request._getters = {}

  /**
   * For hooks
   */
  Request._hooks = {
    before: [],
    after: []
  }

  /**
   * Reference to the Config provider
   */
  Request.Config = Config

  return Request
}
