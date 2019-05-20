'use strict';

// const assert = require('assert');
const mm = require('..');

describe('test/mock_http_agent.test.js', () => {
  describe('app mode', () => {
    let app;
    let agent;
    before(() => {
      app = mm.app({
        baseDir: 'http-agent',
      });
      return app.ready().then(() => {
        agent = app.httpAgent();
      });
    });
    after(() => app.close());
    afterEach(mm.restore);

    it('should not cookies', function(done) {
      agent
        .get('/return')
        .expect(':(', done);
    });

    it('should save cookies', function(done) {
      agent
        .get('/')
        .expectHeader('set-cookie')
        .expect(200, done);
    });

    it('should send cookies', function(done) {
      agent
        .get('/return')
        .expect('hey', done);
    });
  });
});
