'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ServiceProvider } = require('adonis-fold')
const _ = require('lodash')

class VowProvider extends ServiceProvider {
  register () {
    this.app.singleton('Test/Runner', (app) => {
      const Runner = require('../src/Runner')
      return new Runner(app.use('Adonis/Src/Env'))
    })

    this.app.singleton('Test/Cli', (app) => {
      const Env = app.use('Adonis/Src/Env')
      const Cli = require('../src/Cli')
      return new Cli(Env)
    })

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

    this.app.bind('Test/ApiClient', (app) => {
      const Env = app.use('Adonis/Src/Env')
      const ApiClient = require('../src/ApiClient')

      return function ({ Context }) {
        Context.getter('client', function () {
          return new ApiClient(Env, this.assert)
        }, true)
      }
    })

    this.app.bind('Adonis/Commands/Test', (app) => {
      const RunTests = require('../commands/RunTests')
      return new RunTests(app.use('Test/Runner'), app.use('Test/Cli'))
    })
  }
}

module.exports = VowProvider
