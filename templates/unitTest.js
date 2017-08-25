'use strict'

const { test } = use('Test/Suite')('Example test suite')

test('dummy test to learn to test 2 + 2', ({ assert }) => {
  assert.equal(2 + 2, 4)
})
