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
const upath = require('upath')
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
    assert.equal(this.cli._testGroups.unit, 'test/unit/**/*.spec.js')
  })

  test('set correct global for functional tests', (assert) => {
    assert.equal(this.cli._testGroups.functional, 'test/functional/**/*.spec.js')
  })

  test('set correct global for test files to be ignored', (assert) => {
    assert.deepEqual(this.cli._ignoreTests, [])
  })

  test('define different glob for unit tests', (assert) => {
    const cli = new Cli(new Env(), new Helpers(path.join(__dirname)))
    cli.group('unit', 'unit/**/*.js')
    assert.equal(cli._testGroups.unit, 'unit/**/*.js')
  })

  test('define different glob for functional tests', (assert) => {
    const cli = new Cli(new Env(), new Helpers(path.join(__dirname)))
    cli.group('functional', 'functional/**/*.js')
    assert.equal(cli._testGroups.functional, 'functional/**/*.js')
  })

  test('use env variable for ignore tests glob', (assert) => {
    const env = new Env()
    env.set('IGNORE_TESTS', 'test/foo.spec.js')
    const cli = new Cli(env, new Helpers(path.join(__dirname)))
    assert.equal(cli._ignoreTests, 'test/foo.spec.js')
  })

  test('set proper glob for loading tests', (assert) => {
    const glob = this.cli._getGlob([this.cli._testGroups.unit])
    assert.deepEqual(glob, [path.join(this.helpers.appRoot(), 'test/unit/**/*.spec.js')])
  })

  test('exclude tests using glob', (assert) => {
    const glob = this.cli._getGlob([this.cli._testGroups.unit], ['test/unit/_skip.spec.js'])
    assert.deepEqual(glob, [
      path.join(this.helpers.appRoot(), 'test/unit/**/*.spec.js'),
      `!${path.join(this.helpers.appRoot(), 'test/unit/_skip.spec.js')}`
    ])
  })

  test('get all test files', async (assert) => {
    const unitTestFile = path.join(this.helpers.appRoot(), 'test/unit/sample.spec.js')
    const functionalTestFile = path.join(this.helpers.appRoot(), 'test/functional/sample.spec.js')

    await fs.ensureFile(unitTestFile)
    await fs.ensureFile(functionalTestFile)

    const testsFiles = await this.cli.getTestFiles()
    assert.deepEqual(testsFiles, [
      upath.normalize(unitTestFile),
      upath.normalize(functionalTestFile)
    ])
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
    assert.deepEqual(testsFiles, [
      upath.normalize(unitTestFile),
      upath.normalize(functionalTestFile)
    ])
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
    assert.deepEqual(testsFiles, [upath.normalize(functionalTestFile)])
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
    assert.deepEqual(testsFiles, [
      upath.normalize(unitTestFile),
      upath.normalize(functionalTestFile)
    ])
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
    this.cli.group('unit', null)
    const testsFiles = await this.cli.getTestFiles()
    assert.deepEqual(testsFiles, [upath.normalize(functionalTestFile)])
  })

  test('filter for files', async (assert) => {
    const unitTestFileOne = path.join(this.helpers.appRoot(), 'test/unit/sample-one.spec.js')
    const unitTestFileTwo = path.join(this.helpers.appRoot(), 'test/unit/sample-two.spec.js')

    await fs.ensureFile(unitTestFileOne)
    await fs.ensureFile(unitTestFileTwo)

    const testsFiles = await this.cli.getTestFiles(['sample-one'])
    assert.deepEqual(testsFiles, [upath.normalize(unitTestFileOne)])

    const testsFilesAll = await this.cli.getTestFiles(['sample'])
    assert.deepEqual(testsFilesAll, [
      upath.normalize(unitTestFileOne),
      upath.normalize(unitTestFileTwo)
    ])
  })
})
