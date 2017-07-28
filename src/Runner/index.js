'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { Runner, reporters } = require('japa/api')
const pSeries = require('p-series')
const { resolver } = require('@adonisjs/fold')

const Suite = require('../Suite')
const props = require('../../lib/props')

/**
 * Test runner is used to run the test using
 * Adonisjs cli.
 *
 * @class TestRunner
 * @static
 */
class TestRunner {
  constructor (Env) {
    this.clear()
    this._reporter = Env.get('REPORTER', reporters.list)
  }

  /**
   * Executes the stack of promises before or
   * after running the tests
   *
   * @method _executedRunnerStack
   *
   * @param  {String}             event
   *
   * @return {Promise}
   *
   * @private
   */
  _executedRunnerStack (event) {
    return pSeries(this._stack[event])
  }

  /**
   * Runs all traits attached to a suite
   *
   * @method _runTraits
   *
   * @param  {Object}   suite
   *
   * @return {void}
   *
   * @private
   */
  _runTraits (suite) {
    suite.traits.forEach((trait) => {
      if (typeof (trait.action) === 'function') {
        return trait.action(suite, trait.options)
      }
      const resolvedTrait = resolver.resolve(trait.action)
      if (resolvedTrait.handle) {
        return resolvedTrait.handle(suite, trait.options)
      }
      resolvedTrait(suite, trait.options)
    })
  }

  /**
   * Clear properties of runner.
   *
   * @method clear
   *
   * @return {void}
   */
  clear () {
    props.grep = null
    props.timeout = 2000
    props.bail = false
    this._stack = {
      before: [],
      after: []
    }
    this._suites = []
  }

  /**
   * Add a new suite to the runner. `suite` instance
   * can be used to add new tests.
   *
   * @method suite
   *
   * @param  {String} title
   *
   * @return {Suite}
   */
  suite (title) {
    const suite = new Suite(title)
    this._suites.push(suite)
    return suite
  }

  /**
   * Add global timeout for all the tests
   *
   * @method timeout
   *
   * @param  {Number} timeout
   *
   * @return {void}
   */
  timeout (timeout) {
    props.timeout = timeout
  }

  /**
   * Exit early when tests fails
   *
   * @method bail
   *
   * @param  {Boolean} state
   *
   * @return {void}
   */
  bail (state) {
    props.bail = state
  }

  /**
   * Add grep term to filter the tests.
   *
   * @method grep
   *
   * @param  {String} term
   *
   * @chainable
   */
  grep (term) {
    props.grep = term
    return this
  }

  /**
   * A series of actions to be executed before
   * executing any of the tests
   *
   * @method before
   *
   * @param  {Function} callback
   *
   * @chainable
   */
  before (callback) {
    this._stack.before.push(callback)
    return this
  }

  /**
   * A series of actions to be executed after
   * executing all of the tests.
   *
   * @method after
   *
   * @param  {Function} callback
   *
   * @chainable
   */
  after (callback) {
    this._stack.after.push(callback)
    return this
  }

  /**
   * Run all registered tests in following order.
   *
   * 1. Runner before actions
   * 2. Suite
   *   1. Suite traits
   *   2. Suite tests
   * 3. Runner after actions
   *
   * @method run
   *
   * @return {Promise}
   */
  async run () {
    await this._executedRunnerStack('before')

    /**
     * Storing errors thrown by any of the
     * tests and throwing them after
     * running the runner after
     * hook.
     */
    let testsError = null
    let groups = []

    /**
     * Execute tests
     */
    try {
      /**
       * All traits are executed even before suite is
       * executed. So if someone is trying to perform
       * some global changes, they should use hooks
       * over using the trait callback
       */
      this._suites.forEach((suite) => {
        this._runTraits(suite)
        groups.push(suite.group)
      })
      await new Runner(groups, this._reporter, props).run()
    } catch (error) {
      testsError = error
    }

    /**
     * Run after hooks
     */
    await this._executedRunnerStack('after')

    /**
     * Finally throw error
     */
    if (testsError) {
      throw testsError
    }
  }
}

module.exports = TestRunner
