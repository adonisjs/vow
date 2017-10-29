## Register provider

The provider must be registered as an `aceProvider`, since there is no point in loading test runner when running your app.


```js
const aceProviders = [
  '@adonisjs/vow/providers/VowProvider'
]
```

## Run tests
That's all you really need to do in order to get up and running. Now you can run tests by executing following command.

```bash
adonis test
```

For help, run

```bash
adonis test --help
```

## Environment files

The vow provider attempts to load the `.env.test` file when running tests. Any variables placed inside this file will override the actual variables.
