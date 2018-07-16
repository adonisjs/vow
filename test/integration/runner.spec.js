'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const jTest = require('japa')
const app = require('./app')

jTest.group('Runner', (group) => {
  group.before(async () => {
    await app()
  })

  jTest('write a new test', async (jAssert) => {
    jAssert.plan(1)

    const { test } = use('Test/Suite')('My Sample suite')
    const runner = use('Test/Runner')

    test('2 + 2 is 4', function ({ assert }) {
      jAssert.isTrue(true)
      assert.equal(2 + 2, 4)
    })
    await runner.run()
  })

  jTest('define suite traits', async (jAssert) => {
    jAssert.plan(1)

    const { test, trait } = use('Test/Suite')('My Sample suite')
    trait(function ({ Context }) {
      Context.getter('foo', function () {
        return 'bar'
      })
    })

    const runner = use('Test/Runner')

    test('2 + 2 is 4', function ({ assert, foo }) {
      jAssert.isTrue(true)
      assert.equal(foo, 'bar')
    })
    await runner.run()
  })

  jTest('define suite hooks', async (jAssert) => {
    jAssert.plan(3)

    const { test, beforeEach, afterEach } = use('Test/Suite')('My Sample suite')
    const called = []

    beforeEach(() => {
      called.push('beforeEach')
    })

    afterEach(() => {
      called.push('afterEach')
    })

    const runner = use('Test/Runner')
    test('2 + 2 is 4', function ({ assert }) {
      jAssert.isTrue(true)
      assert.equal(2 + 2, 4)
    })

    test('3 + 3 is 6', function ({ assert }) {
      jAssert.isTrue(true)
      assert.equal(3 + 3, 6)
    })

    await runner.run()
    jAssert.deepEqual(called, ['beforeEach', 'afterEach', 'beforeEach', 'afterEach'])
  })

  jTest('define failing test', async (jAssert) => {
    const { test } = use('Test/Suite')('My Sample suite')

    const runner = use('Test/Runner')
    test.failing('2 + 2 is 4', function ({ assert }) {
      assert.equal(2 + 2, 5)
    })

    await runner.run()
  })

  jTest('define skip test', async (jAssert) => {
    const { test } = use('Test/Suite')('My Sample suite')

    const runner = use('Test/Runner')
    test.skip('2 + 2 is 4', function ({ assert }) {
      assert.equal(2 + 2, 5)
    })

    await runner.run()
  })
})
