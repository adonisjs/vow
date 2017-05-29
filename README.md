
# Testing In AdonisJs

Testing in AdonisJs should be natural, simple and intutive enough that even a entry level guy can write tests.

One should be able to do follow

1. Load entire adonisjs app.
2. Run custom code before the test-runner and after the test-runner.
3. Run stuff before the test-suite and after the test-suite
4. Use any service providers.
5. Fake ioc container bindings.
6. Use middleware for testing


## Dummy syntax.

```js
const Runner = use('Test/Runner')

// Applied on all the suites and also re-initiatied for each
// suite since context is passed along.
Runner.trait([''])
```

```js
const Suite = use('Test/Suite')()

Suite.trait('Lucid/AutoRoll')
Suite.trait('Test/Chrome', options)
Suite.traits([{ 'Test/Chrome': options }])

Suite.before(function () {
})

Suite.after(function () {
})

Suite.beforeEach(function () {  
})

Suite.afterEach(function () {
})

Suite.test('sadasd', async (assert, { browser }) => {
  await browser.visit('')
})

Suite.test('sadasd', async (assert, { browser }) => {
    await browser.visit('')
})
```

Each trait will received following to setup lifecycle

```js
function chromeTrait (suiteInstance) { 
    suiteInstance.beforeEach(() => {
    })

    Context.getter('browser', function () {
        return new Browser()
    }, true)
}
```

Also with class

```js
class ChromeTrait {
    static get inject () {

    }

    handle (suiteInstance) {
        suiteInstance.beforeEach(() => {
        })
    }
}
```

In nutshell we have

1. Test Runner - The guy which starts and ends the tests
2. Test Suite - Each suite can have traits, which are called as soon as user calls `test.trait()`
3. Context ( set for each test ) - Each tests has it's own context

Rest all is JAPA and other tools
