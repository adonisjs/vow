'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const superagent = require('superagent')

module.exports = function (BaseRequest, Response) {
  /**
   * The api request class is used to make
   * HTTP requests.
   *
   * @class ApiRequest
   * @constructor
   */
  class ApiRequest extends BaseRequest {
    constructor (url, verb, assert) {
      super()
      this._agent = superagent[verb](url)
      this._assert = assert
    }

    /* istanbul ignore next */
    /**
     * Set request body
     *
     * @method send
     *
     * @param {Object} data
     *
     * @chainable
     */
    send (...args) {
      this._agent.send(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set query string
     *
     * @method query
     *
     * @param  {Object} data
     *
     * @chainable
     */
    query (...args) {
      this._agent.query(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set request type
     *
     * @method type
     *
     * @param  {String} type
     *
     * @chainable
     */
    type (...args) {
      this._agent.type(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set number of retries to be made when request
     * fails
     *
     * @method retry
     *
     * @param  {Number} count
     *
     * @chainable
     */
    retry (...args) {
      this._agent.retry(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Sort query the query string
     *
     * @method sortQuery
     *
     * @param  {Function} [sortFn]
     *
     * @chainable
     */
    sortQuery (...args) {
      this._agent.sortQuery(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set https key
     *
     * @method key
     *
     * @param  {String} key
     *
     * @chainable
     */
    key (...args) {
      this._agent.key(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set ssl certificate
     *
     * @method cert
     *
     * @param  {String} certificate
     *
     * @chainable
     */
    cert (...args) {
      this._agent.cert(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set CA certification to trust
     *
     * @method ca
     *
     * @param  {String} certificate
     *
     * @chainable
     */
    ca (...args) {
      this._agent.ca(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set http request timeout
     *
     * @method timeout
     *
     * @param  {Object} options
     *
     * @chainable
     *
     * @example
     * ```
     * .timeout({
     *    response: 5000,
     *    deadline: 60000
     *  })
     * ```
     */
    timeout (...args) {
      this._agent.timeout(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set number of redirects to follow
     *
     * @method redirects
     *
     * @param  {Number} count
     *
     * @chainable
     */
    redirects (...args) {
      this._agent.redirects(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Attach file to be uploaded
     *
     * @method attach
     *
     * @param  {String} key
     * @param  {String} path
     * @param  {String} [name]
     *
     * @chainable
     */
    attach (...args) {
      this._agent.attach(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set form data field
     *
     * @method field
     *
     * @param {String} key
     * @param {String|Array} value
     *
     * @chainable
     */
    field (...args) {
      this._agent.field(...args)
      return this
    }

    /**
     * Add accepts header
     *
     * @method accept
     *
     * @param  {String} value
     *
     * @chainable
     */
    accept (...args) {
      this._agent.accept(...args)
      return this
    }

    /* istanbul ignore next */
    /**
     * Set `Access-Control-Allow-Origin` header
     *
     * @method withCredentials
     *
     * @chainable
     */
    withCredentials (...args) {
      this._agent.withCredentials(...args)
      return this
    }

    /**
     * Execute request
     *
     * @method end
     *
     * @return {Response}
     */
    async end () {
      await this.exec('before')

      /**
       * Set cookies when defined
       */
      if (this.cookies.length) {
        this._agent.set('Cookie', this.cookies.map((cookie) => `${cookie.key}=${cookie.value}`))
      }

      /**
       * Set headers when defined
       */
      if (this.headers.length) {
        this.headers.forEach((header) => (this._agent.set(header.key, header.value)))
      }

      let response = null

      try {
        response = await this._agent
      } catch (error) {
        /**
         * Throw error when not a response
         * error
         */
        if (!error.response) {
          throw error
        }
        response = error.response
      }

      await this.exec('after')
      return new this.constructor.Response(response, this._assert)
    }
  }

  /**
   * Reference to response class.
   *
   * @type {ApiResponse}
   */
  ApiRequest.Response = Response

  return ApiRequest
}
