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

const sleep = function (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

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

  test('add before response hook', (assert) => {
    const Response = ResponseManager(new Config())
    const fn = function () {}
    Response.before(fn)
    assert.deepEqual(Response._hooks.before, [fn])
  })

  test('add after response hook', (assert) => {
    const Response = ResponseManager(new Config())
    const fn = function () {}
    Response.after(fn)
    assert.deepEqual(Response._hooks.after, [fn])
  })

  test('execute hooks in sequence', async (assert) => {
    const Response = ResponseManager(new Config())

    const stack = []
    Response.before(() => {
      stack.push('1')
    })

    Response.before(async () => {
      await sleep(100)
      stack.push('2')
    })

    Response.before(() => {
      stack.push('3')
    })

    const response = new Response()
    await response.exec('before')
    assert.deepEqual(stack, ['1', '2', '3'])
  })

  test('throw exception when invalid hook type is passed', async (assert) => {
    assert.plan(1)

    const Response = ResponseManager(new Config())
    const response = new Response()

    try {
      await response.exec('foo')
    } catch ({ message }) {
      assert.equal(message, 'foo is not a valid hook event for vow response')
    }
  })

  test('should have access to response instance inside hook', async (assert) => {
    assert.plan(1)
    const Response = ResponseManager(new Config())

    Response.before((req) => {
      assert.deepEqual(req, response)
    })

    const response = new Response()
    await response.exec('before')
  })

  test('read response cookies', async (assert) => {
    const server = http.createServer((req, res) => {
      nodeCookie.create(res, 'user', 'virk')
      res.end()
    }).listen(PORT)

    const res = await superagent.get(BASE_URL)
    const Response = ResponseManager(new Config())
    const response = new Response(res.headers)
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
    const response = new Response(res.headers)
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
    const response = new Response(res.headers)
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
    const response = new Response(res.headers)
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
    const response = new Response(res.headers)
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
    const response = new Response(res.headers)
    assert.deepEqual(response.plainCookies, { user: 'virk' })
    server.close()
  })
})
