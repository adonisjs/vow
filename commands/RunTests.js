'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const { Command } = require('@adonisjs/ace')

class RunTests extends Command {
  constructor (runner, cli) {
    super()
    this.runner = runner
    this.cli = cli
  }

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
    { --files=@value: Pick only specific files. File names are seperated by comma }
    { --grep=@value: Grep on tests title to run only selected tests }
    { --glob=@value: Define a custom glob to pick test files }`
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

  /**
   * Injecting dependencies via IoC container
   *
   * @method inject
   *
   * @return {Array}
   */
  static get inject () {
    return ['Test/Runner', 'Test/Cli']
  }

  /**
   * Handle method called by ace when test command
   * is executed
   *
   * @method handle
   *
   * @param  {String}  options.type
   * @param  {Boolean} options.bail
   * @param  {Number}  options.timeout
   * @param  {String}  options.files
   * @param  {Boolean} options.grep
   * @param  {String}  options.glob
   *
   * @return {void}
   */
  async handle ({ type }, { bail, timeout, files, grep, glob }) {
    this.runner.bail(bail || false)

    /**
     * If grep statement is defined, use it
     */
    if (grep) {
      this.runner.grep(grep)
    }

    /**
     * If user has asked to run only unit tests,
     * test functional tests glob to null
     */
    if (type === 'unit' || (typeof (glob) === 'string' && glob)) {
      this.cli.functional(glob)
    }

    /**
     * If user has asked for functional tests, then
     * set unit tests glob to null
     */
    if (type === 'functional' || (typeof (glob) === 'string' && glob)) {
      this.cli.unit(null)
    }

    /**
     * If there is a global timeout set it on
     * runner
     */
    if (timeout && Number(timeout)) {
      this.runner.timeout(Number(timeout))
    }

    /**
     * Only run tests for following files ( only if defined )
     *
     * @type {Array}
     */
    const filesToPick = typeof (files) === 'string' ? files.split(',') : []

    /**
     * Getting all test files from the cli
     */
    let testFiles = await this.cli.getTestFiles()

    /**
     * If there are specific files defined, then grep on
     * them to pick only those files
     */
    if (_.size(filesToPick)) {
      testFiles = _.filter(testFiles, (file) => {
        return !!_.find(filesToPick, (selectedFile) => {
          return file.endsWith(selectedFile.trim())
        })
      })
    }

    try {
      _.each(testFiles, (file) => require(file))
      await this.runner.run()
    } catch (error) {
      if (!this.runner.executedStack) {
        console.error(error)
      }
    }
  }
}

module.exports = RunTests
