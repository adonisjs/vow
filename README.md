
# Adonis vow 💂

| Test runner for Adonis framework with batteries included 🔋


[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Appveyor][appveyor-image]][appveyor-url]
[![Coveralls][coveralls-image]][coveralls-url]

Adonis vow is the test runner for Adonis framework, just install and register the provider and BOOM it just works.

<img src="http://res.cloudinary.com/adonisjs/image/upload/q_100/v1497112678/adonis-purple_pzkmzt.svg" width="200px" align="right" hspace="30px" vspace="40px">

## Setup

```bash
adonis install @adonisjs/vow
```

Read setup [instructions](instructions.md)

## Concepts

The test runner is bare bones that you need to setup and run tests using your command line. But it comes with a powerful concept of traits.

### Traits

Traits are building blocks for your tests. Features like **Database transactions**, **Api client**, **Browser client**, they all are built on top of the API provided by traits.

```js
const { trait } = use('Test/Suite')('Sample test suite')

trait((suiteInstance) => {
})
```

### Suite
A test suite is a combination of tests that you want to group inside a single file or group them logically.

Each suite has it's own set of traits, which means adding traits for a single suite, doesn't collides with the other suite :)

### Hooks
Each suite has a lifecycle and you can hook into that lifecycle by adding methods to one of the following events.

```js
const suite = use('Test/Suite')('Sample test suite') 

suite.before(() => {
 // executed before the suite
})

suite.after(() => {
 // executed after the suite
})

suite.beforeEach(() => {
 // executed before each test
})

suite.afterEach(() => {
 // executed after each test
})
```

### Context

Each test suite has a context, which is instantiated and passed to each test, so this is the right place to hook stuff that you want to be available to tests.

```js
const { trait, test } = use('Test/Suite')('Sample test suite')

trait((suite) => {
  suite.Context.getter('foo', () => 'bar')
})


test('foo is bar', (ctx) => {
  ctx.assert(ctx.foo, 'bar')
})

// using es6 destructuring
test('foo is bar', ({ foo, assert }) => {
  assert(foo, 'bar')
})
```


### Development

The tests for the test runner are written using [japa](https://github.com/thetutlage/japa) and make sure to go through the docs.

## Release History

Checkout [CHANGELOG.md](CHANGELOG.md) file for release history.

## Meta

AdonisJs – [@adonisframework](https://twitter.com/adonisframework) – virk@adonisjs.com

Checkout [LICENSE.txt](LICENSE.txt) for license information

Harminder Virk (Aman) - [https://github.com/thetutlage](https://github.com/thetutlage)

[appveyor-image]: https://img.shields.io/appveyor/ci/thetutlage/adonis-vow/master.svg?style=flat-square

[appveyor-url]: https://ci.appveyor.com/project/thetutlage/adonis-vow

[npm-image]: https://img.shields.io/npm/v/@adonisjs/vow.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@adonisjs/vow

[travis-image]: https://img.shields.io/travis/adonisjs/adonis-vow/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/adonisjs/adonis-vow

[coveralls-image]: https://img.shields.io/coveralls/adonisjs/adonis-vow/develop.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/adonisjs/adonis-vow
