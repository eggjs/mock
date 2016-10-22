'use strict';

const request = require('supertest');
const path = require('path');
const assert = require('power-assert');
const mm = require('..');
const fixtures = path.join(__dirname, 'fixtures');

describe('test/mock_cookies.test.js', function() {

  afterEach(mm.restore);

  before(function(done) {
    this.app = mm.app({
      baseDir: path.join(fixtures, 'apps/mock_cookies'),
      customEgg: path.join(__dirname, '../node_modules/egg'),
    });
    this.app.ready(done);
  });

  it('should not return when don\'t mock cookies', function(done) {
    const ctx = this.app.mockContext();
    assert(!ctx.getCookie('foo'));

    request(this.app.callback())
    .get('/')
    .expect(function(res) {
      res.body.should.eql({});
    })
    .expect(200, done);
  });

  it('should mock cookies', function(done) {
    this.app.mockCookies({
      foo: 'bar cookie',
    });
    const ctx = this.app.mockContext();
    ctx.getCookie('foo').should.equal('bar cookie');

    request(this.app.callback())
    .get('/')
    .expect({
      cookieValue: 'bar cookie',
      cookiesValue: 'bar cookie',
    })
    .expect(200, done);
  });

});
