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
const { Assertion } = require('japa/api')
const http = require('http')
const { Config } = require('@adonisjs/sink')
const BaseResponseManager = require('../../src/Response')
const BaseRequestManager = require('../../src/Request')
const ApiClient = require('../../src/ApiClient')
const nodeCookie = require('node-cookie')

Assertion.use(require('chai-subset'))

const PORT = 3333

test.group('Api Response', (group) => {
  group.before(() => {
    process.env.TEST_SERVER_URL = `http://localhost:${PORT}`
  })

  test('instantiate response', async (assert) => {
    const server = http.createServer((req, res) => res.end()).listen(PORT)

    const config = new Config()
    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    assert.instanceOf(response, api.Request.Response)

    server.close()
  })

  test('assert response status', async (assert) => {
    assert.plan(1)
    const server = http.createServer((req, res) => res.end()).listen(PORT)

    const config = new Config()
    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertStatus(200)

    server.close()
  })

  test('assert response text', async (assert) => {
    assert.plan(1)
    const server = http.createServer((req, res) => res.end('hello')).listen(PORT)

    const config = new Config()
    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertText('hello')

    server.close()
  })

  test('assert response body', async (assert) => {
    assert.plan(1)
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.write(JSON.stringify({ name: 'virk' }))
      res.end()
    }).listen(PORT)

    const config = new Config()
    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertBody({ name: 'virk' })

    server.close()
  })

  test('assert subset of response body', async (assert) => {
    assert.plan(1)
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.write(JSON.stringify({ name: 'virk', created_at: new Date().getTime() }))
      res.end()
    }).listen(PORT)

    const config = new Config()
    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertJSONSubset({ name: 'virk' })

    server.close()
  })

  test('assert response header', async (assert) => {
    assert.plan(1)
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.write(JSON.stringify({ name: 'virk' }))
      res.end()
    }).listen(PORT)

    const config = new Config()
    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertHeader('Content-Type', 'application/json')
    server.close()
  })

  test('assert response plain cookies', async (assert) => {
    assert.plan(1)
    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'total', 20)
      res.end()
    }).listen(PORT)

    const config = new Config()
    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertPlainCookie('total', 20)
    server.close()
  })

  test('assert response encrypted cookies', async (assert) => {
    assert.plan(1)
    const config = new Config()
    config.set('app.appKey', 'averylongrandomkey')

    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'total', 20, {}, config.get('app.appKey'), true)
      res.end()
    }).listen(PORT)

    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertCookie('total', 20)
    server.close()
  })

  test('assert response error', async (assert) => {
    assert.plan(3)
    const config = new Config()
    config.set('app.appKey', 'averylongrandomkey')

    const server = http.createServer((req, res) => {
      res.writeHead(400)
      res.end('Bad request')
    }).listen(PORT)

    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertError('Bad request')
    response.assertStatus(400)
    server.close()
  })

  test('assert response json', async (assert) => {
    assert.plan(1)
    const config = new Config()
    config.set('app.appKey', 'averylongrandomkey')

    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.write(JSON.stringify({ name: 'virk' }))
      res.end()
    }).listen(PORT)

    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    response.assertJSON({ name: 'virk' })
    server.close()
  })

  test('assert redirects', async (assert) => {
    assert.plan(1)
    const config = new Config()
    config.set('app.appKey', 'averylongrandomkey')

    const server = http.createServer((req, res) => {
      if (req.url === '/there') {
        res.end()
        return
      }
      res.writeHead(301, { 'Location': '/there' })
      res.end()
    }).listen(PORT)

    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').redirects(1).end()
    response.assertRedirect('/there')
    server.close()
  })

  test('get reference to app errors', async (assert) => {
    const config = new Config()
    config.set('app.appKey', 'averylongrandomkey')

    const server = http.createServer((req, res) => {
      res.writeHead(500)
      res.end(new Error('foo').toString())
    }).listen(PORT)

    const BaseResponse = BaseResponseManager(config)
    const BaseRequest = BaseRequestManager(config)
    const api = new ApiClient(BaseRequest, BaseResponse, assert)
    const response = await api.get('/').end()
    assert.isDefined(response.error)
    server.close()
  })
})
