'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { Test, Group } = require('japa/api')

const Context = require('../Context')
const props = require('../../lib/props')

/**
 * The test suite is a group of tests under one file. A
 * suite let users define the requirements and behavior
 * of tests.
 *
 * @class Suite
 * @constructor
 */
class Suite {
  constructor (title) {
    /**
     * Each suite is a japa group with some extras
     * on top of it.
     *
     * @type {Object} Japa group instance
     * @attribute group
     */
    this.group = new Group(title, props, false)

    /**
     * List of traits to be executed before executing
     * suite tests
     *
     * @attribute traits
     *
     * @type {Array}
     */
    this.traits = []

    /**
     * Suite context class to be used for adding getters
     * or macros to the context. A new instance of each
     * context is passed to tests.
     *
     * @attribute Context
     *
     * @type {Context}
     */
    this.Context = Context()
    this._explicitTimeout = null
  }

  /**
   * Returns a boolean indicating whether test should
   * be executed or not, based upon the whether a
   * grep statmeent is in place and test title
   * falls in the grep statement.
   *
   * @method _passesGrep
   *
   * @param  {String}    title
   *
   * @return {Boolean}
   *
   * @private
   */
  _passesGrep (title) {
    if (!props.grep) {
      return true
    }
    return title.includes(props.grep)
  }

  /**
   * Add a new test to the group
   *
   * @method _addTest
   *
   * @param  {String}   title
   * @param  {Function} callback
   * @param  {Boolean}   skip
   * @param  {Boolean}   regression
   *
   * @return {Object} Instance of japa test
   *
   * @private
   */
  _addTest (title, callback, skip, regression) {
    const test = new Test(title, callback, props, skip, regression)
    test.resolveArg((assert) => {
      const ctx = new this.Context()
      ctx.assert = assert
      return ctx
    })

    /**
     * Add timeout to the test when suite has timeout
     * on it.
     */
    if (this._explicitTimeout) {
      test.timeout(this._explicitTimeout)
    }

    /**
     * Only add to the group when grep test passes
     */
    if (this._passesGrep(title)) {
      this.group.addTest(test)
    }

    return test
  }

  /**
   * Returns a boolean indicating whether a trait
   * exists or not.
   *
   * @method hasTrait
   *
   * @param  {String}  name
   *
   * @return {Boolean}
   */
  hasTrait (name) {
    return this._traits.find((trait) => trait.action === name)
  }

  /**
   * Hooks to be called before each test inside
   * the suite
   *
   * @method beforeEach
   *
   * @param  {Function} callback
   *
   * @return {void}
   */
  beforeEach (callback) {
    this.group.beforeEach(callback)
  }

  /**
   * Hooks to be called after each test inside
   * the suite
   *
   * @method afterEach
   *
   * @param  {Function} callback
   *
   * @return {void}
   */
  afterEach (callback) {
    this.group.afterEach(callback)
  }

  /**
   * Hooks to be called after all the tests inside
   * the suite has been ended.
   *
   * @method after
   *
   * @param  {Function} callback
   *
   * @return {void}
   */
  after (callback) {
    this.group.after(callback)
  }

  /**
   * Hooks to be called before any the tests inside
   * the suite has started.
   *
   * @method before
   *
   * @param  {Function} callback
   *
   * @return {void}
   */
  before (callback) {
    this.group.before(callback)
  }

  /**
   * Add a new test
   *
   * @method test
   *
   * @param  {String}   title
   * @param  {Function} callback
   *
   * @return {Object} Instance of japa test
   */
  test (title, callback) {
    return this._addTest(title, callback, false, false)
  }

  /**
   * Add a new regression test
   *
   * @method failing
   *
   * @param  {String}   title
   * @param  {Function} callback
   *
   * @return {Object} Instance of japa test
   */
  failing (title, callback) {
    return this._addTest(title, callback, false, true)
  }

  /**
   * Add a new test to be skipped
   *
   * @method skip
   *
   * @param  {String}   title
   * @param  {Function} callback
   *
   * @return {Object} Instance of japa test
   */
  skip (title, callback) {
    return this._addTest(title, callback, true, false)
  }

  /**
   * Timeout for all the tests inside the suite
   *
   * @method timeout
   *
   * @param  {Number} timeout
   *
   * @chainable
   */
  timeout (timeout) {
    this._explicitTimeout = timeout
    return this
  }

  /**
   * Add a new trait to the suite. Traits are executed
   * before any of the tests are executed inside the
   * suite.
   *
   * A trait can be a `plain function`, `a class`, or
   * reference to `ioc container binding`.
   *
   * Class and Ioc container binding should have a handle
   * method on it.
   *
   * @method trait
   *
   * @param  {Function|String|Class} action
   * @param  {Object} [options = {}]
   *
   * @return {void}
   */
  trait (action, options = {}) {
    if (['string', 'function'].indexOf(typeof (action)) <= -1) {
      throw new Error('suite.trait only accepts a function, class or reference to ioc container namespace')
    }
    this.traits.push({ action, options })
  }
}

module.exports = Suite
