'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

module.exports = function (BaseResponse) {
  /**
   * Api response class is used ot read the http
   * response values and run assertions on
   * them
   *
   * @class ApiResponse
   * @constructor
   */
  class ApiResponse extends BaseResponse {
    constructor (res, assert) {
      super(assert, res.headers)
      this._res = res
    }

    /**
     * Reference to response error, only if exists
     *
     * @method error
     *
     * @return {Object|Undefined}
     */
    get error () {
      return this._res.error
    }

    /**
     * Response status
     *
     * @attribute status
     *
     * @return {Number}
     */
    get status () {
      return this._res.status
    }

    /**
     * Response text
     *
     * @attribute text
     *
     * @return {String}
     */
    get text () {
      return this._res.text
    }

    /**
     * Response body
     *
     * @attribute body
     *
     * @return {Mixed}
     */
    get body () {
      return this._res.body
    }

    /**
     * An array of request redirects
     *
     * @method redirects
     *
     * @return {Array}
     */
    get redirects () {
      return this._res.redirects
    }
  }
  return ApiResponse
}
