'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const debug = require('debug')('adonis:vow')
const requestMethods = ['post', 'get', 'patch', 'delete', 'head', 'put']

/**
 * Api client is used to make HTTP requests
 * for testing API's
 *
 * @class ApiClient
 * @constructor
 */
class ApiClient {
  constructor (BaseRequest, BaseResponse, assert) {
    debug('instantiating api client')
    const Response = require('./Response')(BaseResponse)
    this.Request = require('./Request')(BaseRequest, Response)
    this._assert = assert
  }
}

requestMethods.forEach((method) => {
  ApiClient.prototype[method] = function (url) {
    url = /^http(s)?/.test(url) ? url : `${process.env.TEST_SERVER_URL}${url}`
    return new this.Request(url, method, this._assert)
  }
})

module.exports = ApiClient
