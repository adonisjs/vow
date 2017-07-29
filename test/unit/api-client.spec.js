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
const { Env } = require('@adonisjs/sink')
const http = require('http')
const nodeRes = require('node-res')
const nodeCookie = require('node-cookie')
const ApiClient = require('../../src/ApiClient')
Assertion.use(require('chai-subset'))
process.env.APP_KEY = '16charlongsecret'

test.group('Api Client', (group) => {
  group.beforeEach(() => {
    this.server = http.createServer().listen(4000)
  })

  group.afterEach(() => {
    this.server.close()
  })

  test('throw error when unable to connect', async (assert) => {
    assert.plan(1)
    this.server.on('request', (req, res) => {
      res.end('yayy')
    })

    const env = new Env({ TEST_SERVER_URL: 'null:null' })
    const client = new ApiClient(env, assert)
    try {
      const response = await client.get('/')
      console.log(response)
    } catch ({ message }) {
      assert.equal(message, 'getaddrinfo ENOTFOUND null null:80')
    }
  })

  test('initiate client with new request', async (assert) => {
    this.server.on('request', (req, res) => {
      res.end('yayy')
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertText('yayy')
  })

  test('return error thrown by the request', async (assert) => {
    this.server.on('request', (req, res) => {
      res.writeHead(500, { 'content-type': 'application/json' })
      const error = new Error('Http Error')
      res.write(JSON.stringify(error, ['message', 'arguments', 'type', 'name']))
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertStatus(500)
    response.assertError({ message: 'Http Error', name: 'Error' })
  })

  test('return text error thrown by request', async (assert) => {
    this.server.on('request', (req, res) => {
      res.writeHead(500)
      const error = new Error('Http Error')
      res.write(error.message)
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertStatus(500)
    response.assertError('Http Error')
  })

  test('throw assertion error when error does not matches at all', async (assert) => {
    this.server.on('request', (req, res) => {
      res.writeHead(500)
      const error = new Error('Http Error')
      res.write(error.message)
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertStatus(500)
    const fn = () => response.assertError('Wrong message')
    assert.throw(fn, `AssertionError: expected 'Http Error' to equal 'Wrong message'`)
  })

  test('assert on redirect', async (assert) => {
    this.server.on('request', (req, res) => {
      if (req.url === '/') {
        nodeRes.redirect(req, res, '/home')
        res.end()
      } else if (req.url === '/home') {
        res.end()
      }
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertRedirect('/home')
  })

  test('throw error when redirect assertion fails', async (assert) => {
    this.server.on('request', (req, res) => {
      if (req.url === '/') {
        nodeRes.redirect(req, res, '/home')
        res.end()
      } else if (req.url === '/home') {
        res.end()
      }
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    const fn = () => response.assertRedirect('bar')
    assert.throw(fn, 'Request was not redirected to bar')
  })

  test('assert redirect when url has query string', async (assert) => {
    this.server.on('request', (req, res) => {
      if (req.url === '/') {
        nodeRes.redirect(req, res, '/home?page=1')
        res.end()
      } else if (req.url === '/home?page=1') {
        res.end()
      }
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertRedirect('/home')
  })

  test('set proper message when 404 is received', async (assert) => {
    assert.plan(2)
    this.server.on('request', (req, res) => {
      nodeRes.status(res, '404')
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    try {
      response.assertStatus(200)
    } catch ({ message }) {
      assert.equal(message, 'Make sure to define the route: expected 404 to equal 200')
    }
  })

  test('assert subset json', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeRes.send(req, res, { username: 'virk', id: 1 })
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertJSONSubset({ username: 'virk' })
  })

  test('assert subset should fail if expected key is missing', async (assert) => {
    assert.plan(2)

    this.server.on('request', (req, res) => {
      nodeRes.send(req, res, { username: 'virk', id: 1 })
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    try {
      response.assertJSONSubset({ username: 'virk', age: 22 })
    } catch ({ message }) {
      assert.equal(message, 'expected { username: \'virk\', id: 1 } to contain subset { username: \'virk\', age: 22 }')
    }
  })

  test('get response cookies', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeCookie.create(res, 'cart-total', 10, {}, process.env.APP_KEY, true)
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    assert.deepEqual(response.cookies, { 'cart-total': '10' })
  })

  test('get plain cookies', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeCookie.create(res, 'cart-total', 10)
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    assert.deepEqual(response.plainCookies, { 'cart-total': '10' })
  })

  test('do not return expired cookies', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeCookie.create(res, 'cart-total', 10)
      nodeCookie.clear(res, 'cart-total')
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    assert.deepEqual(response.plainCookies, { 'cart-total': '10' })
  })

  test('assert cookie', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeCookie.create(res, 'cart-total', 10, {}, process.env.APP_KEY, true)
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertCookie('cart-total', 10)
  })

  test('assert plain cookie', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeCookie.create(res, 'cart-total', 10, {})
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertPlainCookie('cart-total', 10)
  })

  test('assert header', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeRes.header(res, 'Content-type', 'application/json')
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/')
    response.assertHeader('Content-type', 'application/json')
  })

  test('set request headers', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeRes.send(req, res, req.headers['content-type'])
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/').set('Content-type', 'application/json')
    response.assertText('application/json')
  })

  test('set request cookies', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeRes.send(req, res, nodeCookie.parse(req, process.env.APP_KEY, true))
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/').setCookie('total', 20)
    response.assertBody({ total: '20' })
  })

  test('set json value on cookies', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeRes.send(req, res, nodeCookie.parse(req, process.env.APP_KEY, true))
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/').setCookie('user', { username: 'virk' })
    response.assertBody({ user: { username: 'virk' } })
  })

  test('set plain cookie', async (assert) => {
    this.server.on('request', (req, res) => {
      nodeRes.send(req, res, nodeCookie.parse(req))
      res.end()
    })

    const env = new Env({ TEST_SERVER_URL: 'http://localhost:4000' })
    const client = new ApiClient(env, assert)
    const response = await client.get('/').setPlainCookie('user', { username: 'virk' })
    response.assertBody({ user: { username: 'virk' } })
  })
})
