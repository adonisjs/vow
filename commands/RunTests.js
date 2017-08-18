'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const _ = require('lodash')
const { Command } = require('@adonisjs/ace')
const debug = require('debug')('adonis:vow:command')

class RunTests extends Command {
  constructor (runner, cli, env) {
    super()
    this.runner = runner
    this.cli = cli
    this.env = env
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
    { -b, --bail: Stop running tests on first failure }
    { t-, --timeout: Define a global timeout for all the tests }
    { -f, --files=@value: Pick only specific files. File names are seperated by comma }
    { -g, --grep=@value: Grep on tests title to run only selected tests }
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
    return ['Test/Runner', 'Test/Cli', 'Adonis/Src/Env']
  }

  /**
   * Require the vow file from the project root
   * if there
   *
   * @method _requireVowFile
   *
   * @param  {String}        projectRoot
   *
   * @return {void}
   *
   * @private
   */
  _requireVowFile (projectRoot) {
    try {
      require(path.join(projectRoot, 'vowfile'))(this.cli, this.runner)
      debug('loaded vowfile.js')
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error
      }
    }
  }

  /**
   * Loads the `.env.test` file from the application root
   * directory. If file doesn't exists it will ignore
   * it.
   *
   * @method _requireTestEnvFile
   * @async
   *
   * @param  {String}            projectRoot
   *
   * @return {void}
   *
   * @private
   */
  async _requireTestEnvFile (projectRoot) {
    const testEnvFile = path.join(projectRoot, '.env.test')
    const exists = await this.exists(testEnvFile)
    if (exists) {
      debug('loading .env.test file to merge the env variables')
      this.env.load(testEnvFile)
    }
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
    const projectRoot = this.cli.projectRoot
    await this._requireTestEnvFile(projectRoot)
    this._requireVowFile(projectRoot)

    this.runner.bail(bail || false)

    /**
     * If grep statement is defined, use it
     */
    if (grep) {
      debug('grep term %s', grep)
      this.runner.grep(grep)
    }

    /**
     * If user has asked to run only unit tests,
     * set functional tests glob to null
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
    timeout = Number(timeout)
    if (timeout && !isNaN(timeout)) {
      debug('global timeout %d', timeout)
      this.runner.timeout(timeout)
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
      debug('post --files filter %j', testFiles)
    }

    try {
      /**
       * Setting test url when its not defined
       */
      if (!process.env.TEST_SERVER_URL) {
        process.env.TEST_SERVER_URL = `http://${process.env.HOST}:${process.env.PORT}`
      }
      debug('running test server on %s', process.env.TEST_SERVER_URL)

      /**
       * Requiring all test files.
       */
      _.each(testFiles, (file) => require(file))

      /**
       * Running the test runner
       */
      await this.runner.run()
    } catch (error) {
      /**
       * If log the error when test suite was not executed.
       * Otherwise test reporter will report the error
       */
      if (!this.runner.executedStack) {
        console.error(error)
      }
    }
  }
}

module.exports = RunTests
