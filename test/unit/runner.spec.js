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
const { setupResolver, Env } = require('adonis-sink')
const { ioc } = require('adonis-fold')
const Runner = require('../../src/Runner')

test.group('Runner', (group) => {
  group.before(() => {
    setupResolver()
  })

  group.beforeEach(() => {
    const env = new Env()
    env.set('REPORTER', function () {})
    this.runner = new Runner(env)
  })

  test('add a new suite to the runner', (assert) => {
    const suite = this.runner.suite('foo')
    assert.lengthOf(this.runner._suites, 1)
    assert.deepEqual(this.runner._suites[0], suite)
    assert.equal(suite.group._title, 'foo')
  })

  test('define global timeout for all tests', (assert) => {
    this.runner.timeout(1000)
    const suite = this.runner.suite('foo')
    suite.test('hello')
    assert.equal(suite.group._tests[0]._timeout, 1000)
  })

  test('suite timeout should have priority over global timeout', (assert) => {
    this.runner.timeout(1000)
    const suite = this.runner.suite('foo')
    suite.timeout(1500)
    suite.test('hello')
    assert.equal(suite.group._tests[0]._timeout, 1500)
  })

  test('should be able to grep over tests', (assert) => {
    this.runner.grep('foo')
    const suite = this.runner.suite('test suite')
    suite.test('hello')
    suite.test('foo')
    assert.lengthOf(suite.group._tests, 1)
  })

  test('run tests using japa runner', async (assert) => {
    const suite = this.runner.suite('sample')
    const called = []

    suite.test('hello', function () {
      called.push('hello')
    })

    suite.test('hi', function (a, done) {
      setTimeout(() => {
        called.push('hi')
        done()
      })
    })

    await this.runner.run()
    assert.deepEqual(called, ['hello', 'hi'])
  })

  test('run runner hooks', async (assert) => {
    const called = []

    this.runner.before(function () {
      called.push('before')
    })

    this.runner.after(function () {
      called.push('after')
    })

    await this.runner.run()
    assert.deepEqual(called, ['before', 'after'])
  })

  test('run runner after hook even when test fails', async (assert) => {
    assert.plan(2)
    const called = []

    this.runner.before(function () {
      called.push('before')
    })

    this.runner.after(function () {
      called.push('after')
    })

    const suite = this.runner.suite('sample')
    suite.test('failing', () => {
      throw new Error('Ohh bad')
    })

    try {
      await this.runner.run()
    } catch (error) {
      assert.equal(error[0].error.message, 'Ohh bad')
      assert.deepEqual(called, ['before', 'after'])
    }
  })

  test('run suite traits before running any tests', async (assert) => {
    const suite = this.runner.suite('sample')
    const called = []

    suite.trait(function () {
      called.push('trait 1')
    })

    suite.trait(function () {
      called.push('trait 2')
    })

    await this.runner.run()
    assert.deepEqual(called, ['trait 1', 'trait 2'])
  })

  test('attach values to suite when running suite traits', async (assert) => {
    const suite = this.runner.suite('sample')
    const called = []

    suite.trait(function (__suite__) {
      __suite__.before(function () {
        called.push('before')
      })
      called.push('trait 1')
    })

    suite.trait(function (__suite__) {
      __suite__.after(function () {
        called.push('after')
      })
      called.push('trait 2')
    })

    await this.runner.run()
    assert.deepEqual(called, ['trait 1', 'trait 2', 'before', 'after'])
  })

  test('attach values to suite context via traits', async (assert) => {
    const suite = this.runner.suite('sample')
    const called = []

    suite.trait(function ({ Context }) {
      Context.getter('foo', function () {
        called.push('foo')
        return 'bar'
      })
    })

    suite.test('test', function ({ foo }) {
      called.push(foo)
    })

    await this.runner.run()
    assert.deepEqual(called, ['foo', 'bar'])
  })

  test('attach singleton values to suite context', async (assert) => {
    const suite = this.runner.suite('sample')
    const called = []

    suite.trait(function ({ Context }) {
      Context.getter('foo', function () {
        called.push('foo')
        return 'bar'
      }, true)
    })

    suite.test('test', function (ctx) {
      called.push(ctx.foo)
      called.push(ctx.foo)
    })

    await this.runner.run()
    assert.deepEqual(called, ['foo', 'bar', 'bar'])
  })

  test('have isolote context for each suite', async (assert) => {
    const suite = this.runner.suite('sample')
    const suite1 = this.runner.suite('sample1')
    const called = []

    suite.trait(function ({ Context }) {
      Context.getter('foo', function () {
        called.push('foo')
        return 'bar'
      }, true)
    })

    suite.test('test', function (ctx) {
      called.push(ctx.foo)
    })

    suite1.test('test', function (ctx) {
      called.push(ctx.foo)
    })

    await this.runner.run()
    assert.deepEqual(called, ['foo', 'bar', undefined])
  })

  test('pass ioc container reference to the trait', async (assert) => {
    const suite = this.runner.suite('sample')
    const called = []

    class Foo {
      handle ({ Context }) {
        Context.getter('foo', function () {
          return 'bar'
        })
      }
    }

    ioc.bind('Foo', function () {
      return new Foo()
    })

    suite.trait('Foo')

    suite.test('test', function (ctx) {
      called.push(ctx.foo)
    })

    await this.runner.run()
    assert.deepEqual(called, ['bar'])
  })
})
