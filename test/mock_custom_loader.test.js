'use strict';

const path = require('path');
const assert = require('assert');
const mm = require('..');
const fixtures = path.join(__dirname, 'fixtures');

describe('test/mock_custom_loader.js', () => {
  const pkg = require('egg/package.json');
  if (parseInt(pkg.version, 10) < 2) return;

  let app;
  before(function* () {
    app = mm.app({
      baseDir: path.join(fixtures, 'custom-loader'),
    });
    yield app.ready();
  });
  after(() => app.close());
  afterEach(mm.restore);

  it('should return success', function* () {
    yield app.httpRequest()
      .get('/users/popomore')
      .expect({
        adapter: 'docker',
        repository: 'popomore',
      })
      .expect(200);
  });

  it('should return when mock with data', function* () {
    app.mockRepository('user', 'get', 'mock');
    app.mockAdapter('docker', 'inspectDocker', 'mock');
    yield app.httpRequest()
      .get('/users/popomore')
      .expect({
        adapter: 'mock',
        repository: 'mock',
      })
      .expect(200);
  });

  it('should return when mock the instance', function* () {
    app.mockAdapter(app.adapter.docker, 'inspectDocker', 'mock');
    yield app.httpRequest()
      .get('/users/popomore')
      .expect({
        adapter: 'mock',
        repository: 'popomore',
      })
      .expect(200);
  });

  it('should not override the existing API', function* () {
    assert(app.mockEnv === require('../app/extend/application.js').mockEnv);
  });

});
