'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { Command } = require('adonis-ace')

class RunTests extends Command {
  static get signature () {
    return `test
    { type?: Define test types, needs to be unit or functional }
    { --bail: Stop running tests on first failure }
    { --timeout: Define a global timeout for all the tests }
    { --files: Pick only specific files. File names are seperated by comma }`
  }

  static get description () {
    return 'Run application tests'
  }

  constructor (runner, cli) {
    super()
    this.runner = runner
    this.cli = cli
  }

  handle ({ type }, { bail, timeout, files }) {
    console.log(type)
  }
}

module.exports = RunTests
