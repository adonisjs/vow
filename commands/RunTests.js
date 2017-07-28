'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { Command } = require('@adonisjs/ace')

class RunTests extends Command {
  /**
   * The command signature
   *
   * @method signature
   *
   * @return {String}
   */
  static get signature () {
    return `test
    { type?=all: Define test types, needs to be unit or functional }
    { --bail: Stop running tests on first failure }
    { --timeout: Define a global timeout for all the tests }
    { --files: Pick only specific files. File names are seperated by comma }`
  }

  /**
   * The command description
   *
   * @method description
   *
   * @return {String}
   */
  static get description () {
    return 'Run application tests'
  }

  constructor (runner, cli) {
    super()
    this.runner = runner
    this.cli = cli
  }

  /**
   * Handle method called by ace when test command
   * is executed
   *
   * @method handle
   *
   * @param  {String} options.type
   * @param  {Boolean} options.bail
   * @param  {Number} options.timeout
   * @param  {String} options.files
   *
   * @return {void}
   */
  handle ({ type }, { bail, timeout, files }) {
    if (bail) {
      this.runner.bail(true)
    }

    if (type === 'unit') {
      this.cli.functional(null)
    }

    if (type === 'functional') {
      this.cli.unit(null)
    }

    if (timeout && Number(timeout)) {
      this.runner.timeout(Number(timeout))
    }

    const testFiles = this.cli.getTestFiles()
    testFiles.forEach((file) => require(file))
  }
}

module.exports = RunTests
