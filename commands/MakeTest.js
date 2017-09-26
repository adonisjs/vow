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
const path = require('path')
const { Command } = require('@adonisjs/ace')

class MakeTest extends Command {
  /* istanbul ignore next */
  /**
   * The command signature
   *
   * @method signature
   *
   * @return {String}
   */
  static get signature () {
    return `make:test
    { name: Name of the test file }
    {-f, --functional: Create functional test}
    {-u, --unit: Create unit test}`
  }

  /* istanbul ignore next */
  /**
   * The command description
   *
   * @method description
   *
   * @return {String}
   */
  static get description () {
    return 'Create sample test file'
  }

  /**
   * Ensures the command is executed within the
   * project root
   *
   * @method ensureInProjectRoot
   *
   * @return {void}
   *
   * @private
   */
  async _ensureInProjectRoot () {
    const acePath = path.join(process.cwd(), 'ace')
    const exists = await this.pathExists(acePath)

    if (!exists) {
      throw new Error('Make sure you are inside an Adonisjs app to run make:test command')
    }
  }

  /**
   * Returns the base path for the test file
   * based upon the test type
   *
   * @method _getFilePath
   * @async
   *
   * @param  {Boolean}     unit
   * @param  {Boolean}     functional
   *
   * @return {String}
   *
   * @private
   */
  async _getFilePath (unit, functional) {
    let type = 'unit'

    /**
     * Prompt for test type when no type is
     * defined
     */
    if (!unit && !functional) {
      type = await this.choice('Select the type of test to create', [
        {
          name: 'Unit test',
          value: 'unit'
        },
        {
          name: 'Functional test',
          value: 'functional'
        }
      ])
    } else if (functional) {
      type = 'functional'
    }

    return path.join(process.cwd(), 'test', type)
  }

  /**
   * Generates the test file
   *
   * @method _generateTest
   *
   * @param  {String}      testPath
   * @param  {String}      name
   *
   * @return {void}
   *
   * @private
   */
  async _generateTest (testPath, name) {
    const template = await this.readFile(path.join(__dirname, '../templates/unitTest.mustache'), 'utf-8')
    await this.generateFile(testPath, template, { name })
  }

  /**
   * Method executed by ace when command is called. It
   * will create a new sample test for the user.
   *
   * @method handle
   *
   * @param  {String} options.name
   * @param  {Boolean} options.unit
   * @param  {Boolean} options.functional
   *
   * @return {void}
   */
  async handle ({ name }, { unit, functional }) {
    const basePath = await this._getFilePath(unit, functional)
    const testPath = path.join(basePath, `${_.kebabCase(_.lowerCase(name))}.spec.js`)
    const incrementalPath = testPath.replace(process.cwd(), '').replace(path.sep, '')

    try {
      await this._ensureInProjectRoot()
      await this._generateTest(testPath, _.startCase(name))
      this.completed('create', incrementalPath)

      /**
       * Return testPath if command executed programatically
       */
      if (!this.viaAce) {
        return testPath
      }
    } catch (error) {
      /**
       * Throw error if command executed programatically
       */
      if (!this.viaAce) {
        throw error
      }
      this.error(error.message)
    }
  }
}

module.exports = MakeTest
