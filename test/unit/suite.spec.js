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
const Suite = require('../../src/Suite')
const props = require('../../lib/props')

test.group('Suite', () => {
  test('add a new test to the suite', (assert) => {
    const suite = new Suite('foo')
    suite.test('hello', function () {})
    assert.lengthOf(suite.group._tests, 1)
    assert.equal(suite.group._tests[0]._title, 'hello')
  })

  test('add a new failing test to the suite', (assert) => {
    const suite = new Suite('foo')
    suite.failing('hello', function () {})
    assert.lengthOf(suite.group._tests, 1)
    assert.equal(suite.group._tests[0]._title, 'hello')
    assert.isTrue(suite.group._tests[0]._regression)
  })

  test('add a new skippable test to the suite', (assert) => {
    const suite = new Suite('foo')
    suite.skip('hello', function () {})
    assert.lengthOf(suite.group._tests, 1)
    assert.equal(suite.group._tests[0]._title, 'hello')
    assert.isTrue(suite.group._tests[0]._skip)
  })

  test('define test timeout', (assert) => {
    const suite = new Suite('foo')
    suite.test('hello', function () {}).timeout(1000)
    assert.lengthOf(suite.group._tests, 1)
    assert.equal(suite.group._tests[0]._title, 'hello')
    assert.equal(suite.group._tests[0]._timeout, 1000)
  })

  test('define test retries', (assert) => {
    const suite = new Suite('foo')
    suite.skip('hello', function () {}).retry(3)
    assert.lengthOf(suite.group._tests, 1)
    assert.equal(suite.group._tests[0]._title, 'hello')
    assert.equal(suite.group._tests[0]._retry, 3)
  })

  test('define suite beforeEach hook', (assert) => {
    const suite = new Suite('foo')
    const fn = function () {}
    suite.beforeEach(fn)
    assert.lengthOf(suite.group._hooks.beforeEach, 1)
    assert.deepEqual(suite.group._hooks.beforeEach[0]._callback, fn)
  })

  test('define suite afterEach hook', (assert) => {
    const suite = new Suite('foo')
    const fn = function () {}
    suite.afterEach(fn)
    assert.lengthOf(suite.group._hooks.afterEach, 1)
    assert.deepEqual(suite.group._hooks.afterEach[0]._callback, fn)
  })

  test('define suite after hook', (assert) => {
    const suite = new Suite('foo')
    const fn = function () {}
    suite.after(fn)
    assert.lengthOf(suite.group._hooks.after, 1)
    assert.deepEqual(suite.group._hooks.after[0]._callback, fn)
  })

  test('define suite before hook', (assert) => {
    const suite = new Suite('foo')
    const fn = function () {}
    suite.before(fn)
    assert.lengthOf(suite.group._hooks.before, 1)
    assert.deepEqual(suite.group._hooks.before[0]._callback, fn)
  })

  test('define suite timeout', (assert) => {
    const suite = new Suite('foo')
    suite.timeout(1000)
    suite.test('hello', function () {})
    assert.equal(suite.group._tests[0]._timeout, 1000)
  })

  test('test timeout should have priority over suite timeout', (assert) => {
    const suite = new Suite('foo')
    suite.timeout(1000)
    suite.test('hello', function () {}).timeout(1500)
    assert.equal(suite.group._tests[0]._timeout, 1500)
  })

  test('define suite trait as a function', (assert) => {
    const suite = new Suite('foo')
    const fn = function () {}
    suite.trait(fn)
    assert.deepEqual(suite.traits[0].action, fn)
  })

  test('define suite trait as a string', (assert) => {
    const suite = new Suite('foo')
    suite.trait('Foo')
    assert.equal(suite.traits[0].action, 'Foo')
  })

  test('define traits as a class', (assert) => {
    const suite = new Suite('foo')
    class Foo {
      handle () {}
    }
    suite.trait(Foo)
    assert.deepEqual(suite.traits[0].action, Foo)
  })

  test('return true when a trait exists', (assert) => {
    const suite = new Suite('foo')
    suite.trait('Foo')
    assert.isTrue(suite.hasTrait('Foo'))
  })

  test('return false when a trait does not exists', (assert) => {
    const suite = new Suite('foo')
    assert.isFalse(suite.hasTrait('Foo'))
  })

  test('throw exception when trait is not a function, class or string', (assert) => {
    const suite = new Suite('foo')
    const fn = () => suite.trait({})
    assert.throw(fn, 'suite.trait only accepts a function or reference to ioc container namespace')
  })

  test('define trait options', (assert) => {
    const suite = new Suite('foo')
    suite.trait('foo', { hook: 'beforeEach' })
    assert.deepEqual(suite.traits[0].options, { hook: 'beforeEach' })
  })

  test('do not add test to the stack when there is a grep statement in place', (assert) => {
    props.grep = 'bar'
    const suite = new Suite('foo')
    suite.test('i am just foo', function () {})
    assert.lengthOf(suite.group._tests, 0)
    props.grep = null
  })

  test('adding macro to one suite request should not show up on other suite', (assert) => {
    props.grep = 'bar'
    const suite = new Suite('foo')
    const suite1 = new Suite('bar')

    suite.trait(function ({ Request }) {
      Request.macro('foo', () => 'bar')
    })

    suite.traits.forEach((trait) => trait.action(suite))

    const request = new suite.Request()
    assert.isFunction(request.foo)

    const request1 = new suite1.Request()
    assert.isUndefined(request1.foo)
  })
})
