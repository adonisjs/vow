'use strict'

/*
 * adonis-vow
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const path = require('path')
const fs = require('fs-extra')
const { Env, Helpers } = require('@adonisjs/sink')
const Cli = require('../../src/Cli')

test.group('Cli', (group) => {
  group.beforeEach(() => {
    this.helpers = new Helpers(path.join(__dirname, 'yardstick'))
    this.cli = new Cli(new Env(), this.helpers)
  })

  group.afterEach(async () => {
    delete process.env.UNIT_TESTS
    delete process.env.FUNCTIONAL_TESTS
    delete process.env.IGNORE_TESTS
    await fs.remove(this.helpers.appRoot())
  })

  test('set correct global for unit tests', (assert) => {
    assert.equal(this.cli._unitTests, 'test/unit/*.spec.js')
  })

  test('set correct global for functional tests', (assert) => {
    assert.equal(this.cli._functionalTests, 'test/functional/*.spec.js')
  })

  test('set correct global for test files to be ignored', (assert) => {
    assert.deepEqual(this.cli._ignoreTests, [])
  })

  test('use env variable for unit tests glob', (assert) => {
    const env = new Env()
    env.set('UNIT_TESTS', 'unit/**/*.js')
    const cli = new Cli(env, new Helpers(path.join(__dirname)))
    assert.equal(cli._unitTests, 'unit/**/*.js')
  })

  test('use env variable for functional tests glob', (assert) => {
    const env = new Env()
    env.set('FUNCTIONAL_TESTS', 'functional/**/*.js')
    const cli = new Cli(env, new Helpers(path.join(__dirname)))
    assert.equal(cli._functionalTests, 'functional/**/*.js')
  })

  test('define different glob for unit tests', (assert) => {
    const cli = new Cli(new Env(), new Helpers(path.join(__dirname)))
    cli.unit('unit/**/*.js')
    assert.equal(cli._unitTests, 'unit/**/*.js')
  })

  test('define different glob for functional tests', (assert) => {
    const cli = new Cli(new Env(), new Helpers(path.join(__dirname)))
    cli.functional('functional/**/*.js')
    assert.equal(cli._functionalTests, 'functional/**/*.js')
  })

  test('use env variable for ignore tests glob', (assert) => {
    const env = new Env()
    env.set('IGNORE_TESTS', 'test/foo.spec.js')
    const cli = new Cli(env, new Helpers(path.join(__dirname)))
    assert.equal(cli._ignoreTests, 'test/foo.spec.js')
  })

  test('set proper glob for loading tests', (assert) => {
    const glob = this.cli._getGlob([this.cli._unitTests])
    assert.deepEqual(glob, [path.join(this.helpers.appRoot(), 'test/unit/*.spec.js')])
  })

  test('exclude tests using glob', (assert) => {
    const glob = this.cli._getGlob([this.cli._unitTests], ['test/unit/_skip.spec.js'])
    assert.deepEqual(glob, [
      path.join(this.helpers.appRoot(), 'test/unit/*.spec.js'),
      `!${path.join(this.helpers.appRoot(), 'test/unit/_skip.spec.js')}`
    ])
  })

  test('get all test files', async (assert) => {
    const unitTestFile = path.join(this.helpers.appRoot(), 'test/unit/sample.spec.js')
    const functionalTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample.spec.js')

    await fs.ensureFile(unitTestFile)
    await fs.ensureFile(functionalTestFile)

    const testsFiles = await this.cli.getTestFiles()
    assert.deepEqual(testsFiles, [unitTestFile, functionalTestFile])
  })

  test('remove specific test files', async (assert) => {
    const unitTestFile = path.join(this.helpers.appRoot(), 'test/unit/sample.spec.js')
    const functionalTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample.spec.js')
    const skipTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample_skip.spec.js')

    await fs.ensureFile(unitTestFile)
    await fs.ensureFile(functionalTestFile)
    await fs.ensureFile(skipTestFile)

    this.cli.filter('test/functional/*_skip.spec.js')
    const testsFiles = await this.cli.getTestFiles()
    assert.deepEqual(testsFiles, [unitTestFile, functionalTestFile])
  })

  test('remove multiple test files', async (assert) => {
    const unitTestFile = path.join(this.helpers.appRoot(), 'test/unit/sample.spec.js')
    const functionalTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample.spec.js')
    const skipTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample_skip.spec.js')

    await fs.ensureFile(unitTestFile)
    await fs.ensureFile(functionalTestFile)
    await fs.ensureFile(skipTestFile)

    this.cli.filter(['test/functional/*_skip.spec.js', 'test/unit/sample.spec.js'])
    const testsFiles = await this.cli.getTestFiles()
    assert.deepEqual(testsFiles, [functionalTestFile])
  })

  test('filter files using the filter callback', async (assert) => {
    const unitTestFile = path.join(this.helpers.appRoot(), 'test/unit/sample.spec.js')
    const functionalTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample.spec.js')
    const skipTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample_skip.spec.js')

    await fs.ensureFile(unitTestFile)
    await fs.ensureFile(functionalTestFile)
    await fs.ensureFile(skipTestFile)

    this.cli.filter(function (file) {
      return !file.endsWith('_skip.spec.js')
    })
    const testsFiles = await this.cli.getTestFiles()
    assert.deepEqual(testsFiles, [unitTestFile, functionalTestFile])
  })

  test('throw exception when filter method receives wrong data type', async (assert) => {
    const fn = () => this.cli.filter({})
    assert.throw(fn, 'cli.filter accepts an array/string of globs or a callback function')
  })

  test('remove unit tests by setting global to null', async (assert) => {
    const unitTestFile = path.join(this.helpers.appRoot(), 'test/unit/sample.spec.js')
    const functionalTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample.spec.js')

    await fs.ensureFile(unitTestFile)
    await fs.ensureFile(functionalTestFile)
    this.cli.unit(null)
    const testsFiles = await this.cli.getTestFiles()
    assert.deepEqual(testsFiles, [functionalTestFile])
  })
})
