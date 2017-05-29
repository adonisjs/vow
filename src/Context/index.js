'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Macroable = require('../Macroable')

module.exports = function () {
  class Context extends Macroable {}
  Context._macros = {}
  Context._getters = {}
  return Context
}
