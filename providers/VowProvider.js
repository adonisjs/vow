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

class VowProvider extends ServiceProvider {
  register () {
    this.app.singleton('Test/Runner', (app) => {
      const Runner = require('../src/Runner')
      return new Runner(app.use('Adonis/Src/Config'))
    })

    this.app.bind('Test/Suite', (app) => {
      const Runner = app.use('Test/Runner')
      return function (title) {
        return Runner.suite(title)
      }
    })
  }
}

module.exports = VowProvider
