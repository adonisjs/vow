'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const nodeCookie = require('node-cookie')
const superagent = require('superagent')
const Response = require('./Response')

const superagentMethods = [
  'send',
  'set',
  'query',
  'type',
  'retry',
  'accept',
  'key',
  'cert',
  'timeout',
  'redirects',
  'attach',
  'withCredentials',
  'accept'
]

/**
 * Request class is a wrapper over superagent to
 * make HTTP calls.
 *
 * @class Request
 * @constructor
 */
class Request {
  constructor (url, verb, assert) {
    this.agent = superagent[verb](url)
    this._assert = assert
    this._cookies = []
  }

  /**
   * Set cookies on agent instance if any defined
   *
   * @method _setCookiesIfAny
   *
   * @private
   */
  _setCookiesIfAny () {
    if (this._cookies instanceof Array === true && this._cookies.length) {
      this.agent.set('Cookie', this._cookies)
    }
  }

  /**
   * Hooking into `this.agent.end` and returning it as
   * a promise
   *
   * @method then
   * @async
   *
   * @param  {Function} userResolve
   * @param  {Function} userReject
   *
   * @return {Response}
   */
  then (userResolve, userReject) {
    if (!this._fullfilledPromise) {
      this._fullfilledPromise = new Promise((resolve, reject) => {
        this._setCookiesIfAny()
        this.agent.end((error, response) => {
          if (error && error.response) {
            resolve(new Response(error.response, true, this._assert))
          } else if (error) {
            reject(error)
          } else {
            resolve(new Response(response, false, this._assert))
          }
        })
      })
    }
    return this._fullfilledPromise.then(userResolve, userReject)
  }

  /**
   * The promise catch method
   *
   * @method catch
   *
   * @param  {Function} callback
   *
   * @return {Object}
   */
  catch (callback) {
    return this.then(undefined, callback)
  }

  /**
   * Set cookie on the request
   *
   * @method setCookie
   *
   * @param  {String}  key
   * @param  {Mixed}  value
   *
   * @chainable
   */
  setCookie (key, value) {
    this._cookies.push(`${key}=${nodeCookie.packValue(value, process.env.APP_KEY, true)}`)
    return this
  }

  /**
   * Sets plain cookie on the request
   *
   * @method setPlainCookie
   *
   * @param  {String}       key
   * @param  {Mixed}       value
   *
   * @chainable
   */
  setPlainCookie (key, value) {
    this._cookies.push(`${key}=${nodeCookie.packValue(value)}`)
    return this
  }

  loginAs (user) {
  }
}

superagentMethods.forEach((method) => {
  Request.prototype[method] = function (...args) {
    this.agent[method](...args)
    return this
  }
})

module.exports = Request
