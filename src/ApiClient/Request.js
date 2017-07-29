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

class Request {
  constructor (url, verb, assert) {
    this.agent = superagent[verb](url)
    this._assert = assert
  }

  then (userResolve, userReject) {
    if (!this._fullfilledPromise) {
      this._fullfilledPromise = new Promise((resolve, reject) => {
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

  catch (callback) {
    return this.then(undefined, callback)
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
