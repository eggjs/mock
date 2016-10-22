'use strict';

const path = require('path');
const assert = require('power-assert');
const mm = require('..');

const customEgg = path.join(__dirname, '../node_modules/egg');
const fixtures = path.join(__dirname, 'fixtures');

describe('test/ctx.test.js', function() {

  afterEach(mm.restore);

  let app;
  before(done => {
    app = mm.app({
      baseDir: path.join(fixtures, 'demo'),
      customEgg,
    });
    app.ready(done);
  });

  it('should has logger, app, request', () => {
    const ctx = app.mockContext();
    assert(ctx.app instanceof Object);
    assert(ctx.logger instanceof Object);
    assert(ctx.coreLogger instanceof Object);
    assert(ctx.request.url === '/');
    assert(ctx.request.ip === '127.0.0.1');
  });

  it('should ctx.ip work', () => {
    const ctx = app.mockContext();
    ctx.request.headers['x-forwarded-for'] = '';
    assert(ctx.request.ip === '127.0.0.1');
  });

  it('should has services', function* () {
    const ctx = app.mockContext();
    const data = yield ctx.service.foo.get('foo');
    assert(data === 'bar');
  });

  describe('curl()', () => {
    it('should call curl work', function* () {
      const ctx = app.mockContext();
      const result = yield ctx.curl('https://my.alipay.com');
      assert(result.status === 302);
      assert(result.headers.location === '/portal/i.htm');
    });
  });

});
