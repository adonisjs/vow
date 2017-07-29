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
const { Env } = require('@adonisjs/sink')
const http = require('http')
const nodeRes = require('node-res')
const ApiClient = require('../../src/ApiClient')

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
})
