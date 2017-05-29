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
const Context = require('../src/Context')

test.group('Context', () => {
  test('return a isoloted class instance every time', (assert) => {
    assert.notDeepEqual(Context(), Context())
  })

  test('defining a getter on one context should not show up on other one', (assert) => {
    const Context1 = Context()
    const Context2 = Context()
    Context1.getter('foo', function () {
      return 'bar'
    })

    assert.isUndefined(new Context2().foo)
    assert.equal(new Context1().foo, 'bar')
  })

  test('have isoloted getters', (assert) => {
    const Context1 = Context()
    const Context2 = Context()
    Context1.getter('foo', function () {
      return 'bar'
    })

    Context2.getter('foo', function () {
      return 'baz'
    })

    assert.equal(new Context2().foo, 'baz')
    assert.equal(new Context1().foo, 'bar')
  })
})
