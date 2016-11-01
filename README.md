# egg-mock

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mock.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mock
[travis-image]: https://img.shields.io/travis/eggjs/egg-mock.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-mock
[codecov-image]: https://codecov.io/github/eggjs/egg-mock/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-mock?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-mock.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-mock
[snyk-image]: https://snyk.io/test/npm/egg-mock/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mock
[download-image]: https://img.shields.io/npm/dm/egg-mock.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mock

Mock library for Egg testing.

## Install

```bash
$ npm i egg-mock --save-dev
```

## Usage

### Create testcase

Launch a mock server with `mm.app`

```js
// test/index.test.js
const path = require('path');
const mm = require('egg-mock');
const request = require('supertest');

describe('some test', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'apps/foo'
      customEgg: path.join(__dirname, '../node_modules/egg'),
    });
    return app.ready();
  })
  after(() => app.close());

  it('should request /', () => {
    return request(app.callback())
    .get('/')
    .expect(200);
  });
});
```

Retrieve Agent instance through `app.agent` after `mm.app` started.

Using `mm.cluster` launch cluster server, you can use the same API as `mm.app`;

### Test Application

`baseDir` is optional that is `process.cwd()` by default.

```js
before(() => {
  app = mm.app({
    customEgg: path.join(__dirname, '../node_modules/egg'),
  });
  return app.ready();
});
```

### Test Framework

customEgg is optional that is `process.cwd()` by default.

```js
before(() => {
  app = mm.app({
    baseDir: 'apps/demo',
    customEgg: true,
  });
  return app.ready();
});
```

### Test Plugin

If `eggPlugin.name` is defined in `package.json`, it's a plugin that will be loaded to plugin list automatically.

```js
before(() => {
  app = mm.app({
    baseDir: 'apps/demo',
    customEgg: path.join(__dirname, '../node_modules/egg'),
  });
  return app.ready();
});
```

You can also test the plugin in different framework, e.g. test [aliyun-egg](https://github.com/eggjs/aliyun-egg) and framework-b in one plugin.

```js
describe('aliyun-egg', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'apps/demo',
      customEgg: path.join(__dirname, 'node_modules/aliyun-egg'),
    });
    return app.ready();
  });
});

describe('framework-b', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'apps/demo',
      customEgg: path.join(__dirname, 'node_modules/framework-b'),
    });
    return app.ready();
  });
});
```

If it's detected as an plugin, but you don't want it to be, you can use `plugin = false`.

```js
before(() => {
  app = mm.app({
    baseDir: 'apps/demo',
    customEgg: path.join(__dirname, 'node_modules/egg'),
    plugin: false,
  });
  return app.ready();
});
```

## API

### mm.app(options)

Create a mock application.

### mm.cluster(options)

Create a mock cluster server, but you can't use API in application, you should test using `supertest`.

```js
const mm = require('egg-mock');
describe('test/app.js', () => {
  let app, config;
  before(() => {
    app = mm.cluster();
    return app.ready();
  });
  after(() => app.close());

  it('some test', () => {
    return request(app.callback())
    .get('/config')
    .expect(200)
  });
});
```

You can disable coverage, because it's slow.

```js
mm.cluster({
  coverage: false,
});
```

### mm.env(env)

Mock env when starting

```js
// production environment
mm.env('prod');
mm.app({
  cache: false,
});
```

Environment list https://github.com/eggjs/egg-core/blob/master/lib/loader/egg_loader.js#L82

### mm.consoleLevel(level)

Mock level that print to stdout/stderr

```js
// 不输出到终端
mm.consoleLevel('NONE');
```

level list: `DEBUG`, `INFO`, `WARN`, `ERROR`, `NONE`

### mm.restore

restore all mock data, e.g. `afterEach(mm.restore)`

### options

Options for `mm.app` and `mm.cluster`

#### baseDir {String}

The directory of application, default is `process.cwd()`.

```js
mm.app({
  baseDir: path.join(__dirname, 'fixtures/apps/demo'),
})
```

You can use a string based on `$CWD/test/fixtures` for short

```js
mm.app({
  baseDir: 'apps/demo',
})
```

#### customEgg {String/Boolean}

The directory of framework

```js
mm.app({
  baseDir: 'apps/demo',
  customEgg: path.join(__dirname, 'fixtures/egg'),
})
```

It can be true when test an framework

#### plugin

The directory of plugin, it's detected automatically.

```js
mm.app({
  baseDir: 'apps/demo',
})
```

#### plugins {Object}

Define a list of plugins

#### cache {Boolean}

Determine whether enable cache. it's cached by baseDir.

#### clean {Boolean}

Clean all logs directory, default is true.

If you are using `ava`, disable it.

### app.mockContext(options)

```js
const ctx = app.mockContext({
  user: {
    name: 'Jason'
  }
});
console.log(ctx.user.name); // Jason
```

### app.mockCookies(data)

```js
app.mockCookies({
  foo: 'bar'
});
const ctx = app.mockContext();
console.log(ctx.getCookie('foo'));
```

### app.mockHeaders(data)

Mock request header

### app.mockSession(data)

```js
app.mockSession({
  foo: 'bar'
});
const ctx = app.mockContext();
console.log(ctx.session.foo);
```


### app.mockService(service, methodName, fn)

```js
it('should mock user name', function* () {
  app.mockService('user', 'getName', function* (ctx, methodName, args) {
    return 'popomore';
  });
  const ctx = app.mockContext();  
  yield ctx.service.user.getName();
});
```

### app.mockServiceError(service, methodName, error)

You can mock an error for service

```js
app.mockServiceError('user', 'home', new Error('mock error'));
```

### app.mockCsrf();

```js
app.mockCsrf();
request(app.callback())
.post('/login')
.expect(302, done);
```

### app.mockUrllib(url, method, data)

Mock `ctx.curl`

```js
app.get('/', function*() {
  const ret = yield this.curl('https://eggjs.org ');
  this.body = ret.data.toString();
});

app.mockUrllib('https://eggjs.org ', {
  // 模拟的参数，可以是 buffer / string / json，
  // 都会转换成 buffer
  // 按照请求时的 options.dataType 来做对应的转换
  data: 'mock taobao',
});
request(app.callback())
.post('/')
.expect('mock taobao', done);
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
