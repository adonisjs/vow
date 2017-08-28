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

module.exports = function () {
  /**
   * This is base request class to be used
   * by other request clients. For example:
   * Api client and browser client.
   *
   * @class BaseRequest
   * @constructor
   */
  class Request extends Macroable {
    constructor (Config) {
      super()
      this.Config = Config
      this._cookies = []
      this._hooks = {
        before: [],
        after: []
      }
    }

    /**
     * Returns an array of cookies to be
     * set as header
     *
     * @method cookies
     *
     * @return {Array}
     */
    get cookies () {
      return this._cookies
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
      const appKey = this.Config.get('app.appKey')
      value = nodeCookie.packValue(value, appKey, !!appKey)
      this._cookies.push({ key, value })
      return this
    }

    /**
     * Add a new hook before request starts
     *
     * @method before
     *
     * @param  {Function} fn
     *
     * @chainable
     */
    before (fn) {
      this._hooks.before.push(fn)
      return this
    }

    /**
     * Add a new hook for after request completes
     *
     * @method after
     *
     * @param  {Function} fn
     *
     * @chainable
     */
    after (fn) {
      this._hooks.after.push(fn)
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

      const hooks = this._hooks[event]
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

  return Request
}
