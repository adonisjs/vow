'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { registrar, ioc } = require('adonis-fold')
const { Helpers, setupResolver, Config, Env } = require('adonis-sink')
const path = require('path')

module.exports = function () {
  return new Promise((resolve, reject) => {
    ioc.singleton('Adonis/Src/Helpers', function () {
      return new Helpers(path.join(__dirname, './'))
    })

    ioc.singleton('Adonis/Src/Env', function () {
      return new Env()
    })

    ioc.singleton('Adonis/Src/Config', function () {
      return new Config()
    })

    setupResolver()
    use('Adonis/Src/Env').set('REPORTER', function () {})

    registrar
      .providers([path.join(__dirname, '../../providers/VowProvider')])
      .registerAndBoot()
      .then(resolve)
      .catch(reject)
  })
}
