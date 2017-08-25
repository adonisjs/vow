'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ServiceProvider } = require('@adonisjs/fold')
const _ = require('lodash')

class VowProvider extends ServiceProvider {
  /**
   * Registers test runner under `Test/Runner` namespace
   *
   * @method _registerTestRunner
   *
   * @return {void}
   *
   * @private
   */
  _registerTestRunner () {
    this.app.singleton('Test/Runner', (app) => {
      const Runner = require('../src/Runner')
      return new Runner(app.use('Adonis/Src/Env'))
    })
  }

  /**
   * Registers test cli under `Test/Cli` namespace
   *
   * @method _registerCli
   *
   * @return {void}
   *
   * @private
   */
  _registerCli () {
    this.app.singleton('Test/Cli', (app) => {
      const Cli = require('../src/Cli')
      return new Cli(app.use('Adonis/Src/Env'), app.use('Adonis/Src/Helpers'))
    })
  }

  /**
   * Registers test suite under `Test/Suite` namespace
   *
   * @method _regiterTestSuite
   *
   * @return {void}
   *
   * @private
   */
  _regiterTestSuite () {
    this.app.bind('Test/Suite', (app) => {
      const Runner = app.use('Test/Runner')
      return (title) => {
        const suite = Runner.suite(title)
        return _.transform(Object.getOwnPropertyNames(Object.getPrototypeOf(suite)), (result, prop) => {
          result[prop] = function (...args) {
            return suite[prop](...args)
          }
        }, {})
      }
    })
  }

  /**
   * Registers api client trait under `Test/ApiClient`
   *
   * @method _registerApiClient
   *
   * @return {void}
   *
   * @private
   */
  _registerApiClient () {
    this.app.bind('Test/ApiClient', (app) => {
      const Env = app.use('Adonis/Src/Env')
      const ApiClient = require('../src/ApiClient')
      return function ({ Context }) {
        Context.getter('client', function () {
          return new ApiClient(Env, this.assert)
        }, true)
      }
    })
  }

  /**
   * Registers test command under `Adonis/Commands/Test`
   * namespace
   *
   * @method _registerTestCommand
   *
   * @return {void}
   *
   * @private
   */
  _registerTestCommand () {
    this.app.bind('Adonis/Commands/Test', (app) => require('../commands/RunTests'))
  }

  /**
   * Registers providers
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this._registerTestRunner()
    this._registerCli()
    this._registerTestCommand()
    this._registerApiClient()
    this._regiterTestSuite()
  }

  /**
   * When provider is booted, fold will call
   * this method
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    const ace = require('@adonisjs/ace')
    ace.addCommand('Adonis/Commands/Test')
  }
}

module.exports = VowProvider
