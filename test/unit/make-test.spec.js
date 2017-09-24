'use strict'

const test = require('japa')
const path = require('path')
const MakeTest = require('../../commands/MakeTest')

test.group('Make test', (group) => {
  group.before(async () => {
    const make = new MakeTest()
    await make.ensureFile(path.join(__dirname, './sample/ace'))
    process.chdir(path.join(__dirname, './sample'))
  })

  group.after(async () => {
    const make = new MakeTest()
    await make.removeDir(path.join(__dirname, './sample'))
    process.chdir(path.join(__dirname, '../../'))
  })

  test('create a test file', async (assert) => {
    const make = new MakeTest()
    await make.handle({ name: 'Foo' }, { unit: true })
    const exists = await make.pathExists(path.join(__dirname, './sample/test/unit/foo.spec.js'))
    assert.isTrue(exists)
  })

  test('create a functional test file', async (assert) => {
    const make = new MakeTest()
    await make.handle({ name: 'Bar' }, { functional: true, unit: true })
    const exists = await make.pathExists(path.join(__dirname, './sample/test/functional/bar.spec.js'))
    assert.isTrue(exists)
  })

  test('throw exception when test file already exists', async (assert) => {
    assert.plan(1)

    const make = new MakeTest()
    try {
      await make.handle({ name: 'Bar' }, { functional: true, unit: true })
    } catch ({ message }) {
      assert.match(message, /already exists/)
    }
  })

  test('throw exception when not inside an adonisjs project', async (assert) => {
    assert.plan(1)
    process.chdir(path.join(__dirname))

    const make = new MakeTest()
    try {
      await make.handle({ name: 'Bar' }, { functional: true, unit: true })
    } catch ({ message }) {
      assert.equal(message, 'Make sure you are inside an Adonisjs app to run make:test command')
    }
  })
})
