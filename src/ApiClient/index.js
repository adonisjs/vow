'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Request = require('./Request')
const apiMethods = ['get', 'post', 'put', 'delete', 'patch']

class ApiClient {
  constructor (Env, assert) {
    this._baseUrl = Env.get('TEST_SERVER_URL')
    this._assert = assert
  }

  /**
   * Returns complete url to the http server.
   *
   * @method _getCompleteUrl
   *
   * @param  {String}        url
   *
   * @return {String}
   *
   * @private
   */
  _getCompleteUrl (url) {
    return `${this._baseUrl}/${url}`.replace(/([^:]\/)\/+/g, '$1')
  }
}

apiMethods.forEach((method) => {
  ApiClient.prototype[method] = function (url) {
    return new Request(this._getCompleteUrl(url), method, this._assert)
  }
})

module.exports = ApiClient
