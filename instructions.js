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

module.exports = async (cli) => {
  try {
    const appRoot = cli.helpers.appRoot()
    /**
     * Copy vow file
     */
    await cli.copy(path.join(__dirname, 'templates/vowfile.js'), path.join(appRoot, 'vowfile.js'))
    cli.command.completed('create', 'vowfile.js')

    /**
     * Copy example test case
     */
    await cli.copy(path.join(__dirname, 'templates/unitTest.js'), path.join(appRoot, 'test/unit/example.spec.js'))
    cli.command.completed('create', 'test/unit/example.spec.js')
  } catch (error) {
    // ignore the error
  }
}
