'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const { Config } = require('@adonisjs/sink')
const http = require('http')
const PORT = '3333'
const BASE_URL = `http://localhost:${PORT}`

const BaseRequestManager = require('../../src/Request')
const BaseResponseManager = require('../../src/Response')
const ApiResponseManager = require('../../src/ApiClient/Response')
const ApiRequestManager = require('../../src/ApiClient/Request')

test.group('Api Client Request', () => {
  test('instantiate class with base request', (assert) => {
    const ApiResponse = ApiResponseManager(BaseResponseManager(new Config()))
    const ApiRequest = ApiRequestManager(BaseRequestManager(new Config()), ApiResponse)
    const api = new ApiRequest('http://localhost:3333', 'get', new Config())
    assert.instanceOf(api, ApiRequest)
  })

  test('make http request to a given url', async (assert) => {
    const ApiResponse = ApiResponseManager(BaseResponseManager(new Config()))
    const ApiRequest = ApiRequestManager(BaseRequestManager(new Config()), ApiResponse)
    const server = http.createServer((req, res) => res.end('handled')).listen(PORT)
    const api = new ApiRequest(BASE_URL, 'get', new Config())
    const { text } = await api.end()
    assert.equal(text, 'handled')
    server.close()
  })

  test('send query string', async (assert) => {
    const ApiResponse = ApiResponseManager(BaseResponseManager(new Config()))
    const ApiRequest = ApiRequestManager(BaseRequestManager(new Config()), ApiResponse)
    const server = http.createServer((req, res) => res.end(req.url)).listen(PORT)
    const api = new ApiRequest(BASE_URL, 'get', new Config())
    const { text } = await api.query({ age: 22 }).end()
    assert.equal(text, '/?age=22')
    server.close()
  })

  test('add macro to BaseRequest', async (assert) => {
    const ApiResponse = ApiResponseManager(BaseResponseManager(new Config()))
    const BaseRequest = BaseRequestManager(new Config())
    BaseRequest.macro('addAge', function () {
      this.query({ age: 22 })
      return this
    })
    const ApiRequest = ApiRequestManager(BaseRequest, ApiResponse)
    const server = http.createServer((req, res) => res.end(req.url)).listen(PORT)
    const api = new ApiRequest(BASE_URL, 'get', new Config())
    const { text } = await api.addAge().end()
    assert.equal(text, '/?age=22')
    server.close()
  })

  test('execute hooks before making request', async (assert) => {
    const ApiResponse = ApiResponseManager(BaseResponseManager(new Config()))
    const BaseRequest = BaseRequestManager(new Config(), ApiResponse)
    BaseRequest.before(function (request) {
      request.query({ age: 22 })
    })
    const ApiRequest = ApiRequestManager(BaseRequest, ApiResponse)
    const server = http.createServer((req, res) => res.end(req.url)).listen(PORT)
    const api = new ApiRequest(BASE_URL, 'get', new Config())
    const { text } = await api.end()
    assert.equal(text, '/?age=22')
    server.close()
  })

  test('set cookies as header', async (assert) => {
    const ApiResponse = ApiResponseManager(BaseResponseManager(new Config()))
    const ApiRequest = ApiRequestManager(BaseRequestManager(new Config()), ApiResponse)
    const server = http.createServer((req, res) => res.end(req.headers.cookie)).listen(PORT)
    const api = new ApiRequest(BASE_URL, 'get', new Config())
    const { text } = await api.cookie('age', 22).end()
    assert.equal(text, 'age=22')
    server.close()
  })

  test('set multiple cookies', async (assert) => {
    const ApiResponse = ApiResponseManager(BaseResponseManager(new Config()))
    const ApiRequest = ApiRequestManager(BaseRequestManager(new Config()), ApiResponse)
    const server = http.createServer((req, res) => res.end(req.headers.cookie)).listen(PORT)
    const api = new ApiRequest(BASE_URL, 'get', new Config())
    const { text } = await api.cookie('age', 22).cookie('name', 'virk').end()
    assert.equal(text, 'age=22; name=virk')
    server.close()
  })

  test('set headers', async (assert) => {
    const ApiResponse = ApiResponseManager(BaseResponseManager(new Config()))
    const ApiRequest = ApiRequestManager(BaseRequestManager(new Config()), ApiResponse)
    const server = http.createServer((req, res) => res.end(req.headers['content-type'])).listen(PORT)
    const api = new ApiRequest(BASE_URL, 'get', new Config())
    const { text } = await api.header('content-type', 'application/json').end()
    assert.equal(text, 'application/json')
    server.close()
  })
})
