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
const RequestManager = require('../../src/Request')
const nodeCookie = require('node-cookie')

const sleep = function (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

test.group('Request', (group) => {
  test('instantiate request', (assert) => {
    const Request = RequestManager(new Config())
    const request = new Request()
    assert.instanceOf(request, Request)
  })

  test('define request getter', (assert) => {
    const Request = RequestManager(new Config())
    Request.getter('foo', () => 'bar')
    const request = new Request()
    assert.equal(request.foo, 'bar')
  })

  test('define request macro', (assert) => {
    const Request = RequestManager(new Config())
    Request.macro('foo', () => 'bar')
    const request = new Request()
    assert.equal(request.foo(), 'bar')
  })

  test('add new cookie', (assert) => {
    const Request = RequestManager(new Config())
    const request = new Request()
    request.cookie('name', 'foo')
    assert.deepEqual(request.cookies, [{ key: 'name', value: 'foo' }])
  })

  test('add encrypted cookie', (assert) => {
    const config = new Config()
    config.set('app.appKey', 'alongrandomstring')
    const Request = RequestManager(config)

    const request = new Request(config)
    request.cookie('name', 'foo')
    assert.equal(nodeCookie.unPackValue(request.cookies[0].value, config.get('app.appKey'), true), 'foo')
  })

  test('add before request hook', (assert) => {
    const Request = RequestManager(new Config())
    const fn = function () {}
    Request.before(fn)
    assert.deepEqual(Request._hooks.before, [fn])
  })

  test('add after request hook', (assert) => {
    const Request = RequestManager(new Config())
    const fn = function () {}
    Request.after(fn)
    assert.deepEqual(Request._hooks.after, [fn])
  })

  test('execute hooks in sequence', async (assert) => {
    const Request = RequestManager(new Config())

    const stack = []
    Request.before(() => {
      stack.push('1')
    })

    Request.before(async () => {
      await sleep(100)
      stack.push('2')
    })

    Request.before(() => {
      stack.push('3')
    })

    const request = new Request()
    await request.exec('before')
    assert.deepEqual(stack, ['1', '2', '3'])
  })

  test('throw exception when invalid hook type is passed', async (assert) => {
    assert.plan(1)

    const Request = RequestManager(new Config())
    const request = new Request()

    try {
      await request.exec('foo')
    } catch ({ message }) {
      assert.equal(message, 'foo is not a valid hook event for vow request')
    }
  })

  test('should have access to request instance inside hook', async (assert) => {
    assert.plan(1)
    const Request = RequestManager(new Config())

    Request.before((req) => {
      assert.deepEqual(req, request)
    })

    const request = new Request()
    await request.exec('before')
  })

  test('add request header', (assert) => {
    const Request = RequestManager(new Config())

    const request = new Request()
    request.header('Auth', '123')
    assert.deepEqual(request.headers, [{ key: 'Auth', value: '123' }])
  })

  test('remove hooks on hydrate', (assert) => {
    const Request = RequestManager(new Config())
    Request.before(function () {})
    assert.isFunction(Request._hooks.before[0])
    Request.hydrate()
    assert.deepEqual(Request._hooks.before, [])
  })
})
