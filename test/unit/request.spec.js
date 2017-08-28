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
const Request = require('../../src/Request')()
const nodeCookie = require('node-cookie')
const sleep = function (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

test.group('Request', (group) => {
  group.beforeEach(() => {
    Request.hydrate()
  })

  test('instantiate request', (assert) => {
    const request = new Request(new Config())
    assert.instanceOf(request, Request)
  })

  test('define request getter', (assert) => {
    Request.getter('foo', () => 'bar')
    const request = new Request(new Config())
    assert.equal(request.foo, 'bar')
  })

  test('define request macro', (assert) => {
    Request.macro('foo', () => 'bar')
    const request = new Request(new Config())
    assert.equal(request.foo(), 'bar')
  })

  test('add new cookie', (assert) => {
    const request = new Request(new Config())
    request.cookie('name', 'foo')
    assert.deepEqual(request.cookies, [{ key: 'name', value: 'foo' }])
  })

  test('add encrypted cookie', (assert) => {
    const config = new Config()
    config.set('app.appKey', 'alongrandomstring')

    const request = new Request(config)
    request.cookie('name', 'foo')
    assert.equal(nodeCookie.unPackValue(request.cookies[0].value, config.get('app.appKey'), true), 'foo')
  })

  test('add before request hook', (assert) => {
    const request = new Request(new Config())
    const fn = function () {}
    request.before(fn)
    assert.deepEqual(request._hooks.before, [fn])
  })

  test('add after request hook', (assert) => {
    const request = new Request(new Config())
    const fn = function () {}
    request.after(fn)
    assert.deepEqual(request._hooks.after, [fn])
  })

  test('execute hooks in sequence', async (assert) => {
    const request = new Request(new Config())
    const stack = []
    request.before(() => {
      stack.push('1')
    })

    request.before(async () => {
      await sleep(100)
      stack.push('2')
    })

    request.before(() => {
      stack.push('3')
    })

    await request.exec('before')
    assert.deepEqual(stack, ['1', '2', '3'])
  })

  test('throw exception when invalid hook type is passed', async (assert) => {
    assert.plan(1)

    const request = new Request(new Config())
    const stack = []
    request.before(() => {
      stack.push('1')
    })

    request.before(async () => {
      await sleep(100)
      stack.push('2')
    })

    request.before(() => {
      stack.push('3')
    })

    try {
      await request.exec('foo')
    } catch ({ message }) {
      assert.equal(message, 'foo is not a valid hook event for vow request')
    }
  })

  test('should have access to request instance inside hook', async (assert) => {
    assert.plan(1)
    const request = new Request(new Config())

    request.before((req) => {
      assert.deepEqual(req, request)
    })
    await request.exec('before')
  })
})
