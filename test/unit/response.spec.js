'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const http = require('http')
const test = require('japa')
const superagent = require('superagent')
const { Config } = require('@adonisjs/sink')
const ResponseManager = require('../../src/Response')
const nodeCookie = require('node-cookie')
const PORT = '3333'
const BASE_URL = `http://localhost:${PORT}`

test.group('Response', () => {
  test('instantiate response', (assert) => {
    const Response = ResponseManager(new Config())
    const response = new Response()
    assert.instanceOf(response, Response)
  })

  test('define response getter', (assert) => {
    const Response = ResponseManager(new Config())
    Response.getter('foo', () => 'bar')
    const response = new Response()
    assert.equal(response.foo, 'bar')
  })

  test('define response macro', (assert) => {
    const Response = ResponseManager(new Config())
    Response.macro('foo', () => 'bar')
    const response = new Response()
    assert.equal(response.foo(), 'bar')
  })

  test('read response cookies', async (assert) => {
    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'user', 'virk')
      res.end()
    }).listen(PORT)

    const res = await superagent.get(BASE_URL)
    const Response = ResponseManager(new Config())
    const response = new Response(assert, res.headers)
    assert.deepEqual(response.cookies, { user: 'virk' })
    server.close()
  })

  test('read multiple cookies', async (assert) => {
    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'user', 'virk')
      nodeCookie.create(res, 'age', 22)
      res.end()
    }).listen(PORT)

    const res = await superagent.get(BASE_URL)
    const Response = ResponseManager(new Config())
    const response = new Response(assert, res.headers)
    assert.deepEqual(response.cookies, { user: 'virk', age: '22' })
    server.close()
  })

  test('read encrypted cookies', async (assert) => {
    const config = new Config()
    config.set('app.appKey', 'alongrandomstring')

    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'user', 'virk', {}, config.get('app.appKey'), true)
      res.end()
    }).listen(PORT)

    const res = await superagent.get(BASE_URL)
    const Response = ResponseManager(config)
    const response = new Response(assert, res.headers)
    assert.deepEqual(response.cookies, { user: 'virk' })
    server.close()
  })

  test('return cookies with options', async (assert) => {
    const config = new Config()
    config.set('app.appKey', 'alongrandomstring')

    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'user', 'virk', { path: '/' })
      res.end()
    }).listen(PORT)

    const res = await superagent.get(BASE_URL)
    const Response = ResponseManager(config)
    const response = new Response(assert, res.headers)
    assert.deepEqual(response.plainCookies, { user: 'virk' })
    server.close()
  })

  test('return null when unable to unparse cookies', async (assert) => {
    const config = new Config()
    config.set('app.appKey', 'alongrandomstring')

    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'user', 'virk', {})
      res.end()
    }).listen(PORT)

    const res = await superagent.get(BASE_URL)
    const Response = ResponseManager(config)
    const response = new Response(assert, res.headers)
    assert.deepEqual(response.cookies, { user: null })
    server.close()
  })

  test('read plain cookies', async (assert) => {
    const config = new Config()
    config.set('app.appKey', 'alongrandomstring')

    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'user', 'virk', {})
      res.end()
    }).listen(PORT)

    const res = await superagent.get(BASE_URL)
    const Response = ResponseManager(config)
    const response = new Response(assert, res.headers)
    assert.deepEqual(response.plainCookies, { user: 'virk' })
    server.close()
  })
})
