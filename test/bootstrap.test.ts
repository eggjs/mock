import { strict as assert } from 'node:assert';
import { getFixtures } from './helper.js';
import mm, { mock, MockApplication } from '../src/index.js';

// TBD: This test case is not working as expected. Need to investigate.
describe('test/bootstrap.test.ts', () => {
  const baseDir = process.env.EGG_BASE_DIR = getFixtures('app');
  let app: MockApplication;
  before(async () => {
    const { getBootstrapApp } = await import('../src/bootstrap.js');
    app = getBootstrapApp();
    await app.ready();
  });

  it('should create app success', () => {
    assert(app.baseDir === baseDir);
  });

  it('should mock and mm success', () => {
    assert(app.baseDir === baseDir);
    mm(app, 'baseDir', 'foo');
    assert(app.baseDir === 'foo');
    mock(app, 'baseDir', 'bar');
    assert.equal(app.baseDir, 'bar');
  });

  it('should afterEach(mm.restore) success', () => {
    assert(app.baseDir === baseDir);
  });

  describe('backgroundTasksFinished()', () => {
    it('should wait for background task 1 finished', async () => {
      await app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 0 });
      await app.httpRequest()
        .get('/counter/plus')
        .expect(200)
        .expect({ counter: 0 });
    });

    it('should wait for background task 2 finished', async () => {
      await app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 1 });
      await app.httpRequest()
        .get('/counter/minus')
        .expect(200)
        .expect({ counter: 1 });
    });

    it.skip('should wait for background task 3 finished', async () => {
      await app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 0 });
      app.mockContext({ superMan: true });
      await app.httpRequest()
        .get('/counter/plus')
        .expect(200)
        .expect({ counter: 0 });
    });

    it.skip('should wait for background task 4 finished', async () => {
      await app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 10 });
      await app.httpRequest()
        .get('/counter/plusplus')
        .expect(200)
        .expect({ counter: 10 });
    });

    it.skip('should wait for background task 5 finished', async () => {
      await app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 12 });
      app.mockContext({ superMan: true });
      await app.httpRequest()
        .get('/counter/plusplus')
        .expect(200)
        .expect({ counter: 12 });
    });

    it.skip('should all reset', async () => {
      await app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 32 });
    });

    it('should always return promise instance', async () => {
      let p = app.backgroundTasksFinished();
      assert(p.then);
      p = app.backgroundTasksFinished();
      assert(p.then);
      p = app.backgroundTasksFinished();
      assert(p.then);
      await app.backgroundTasksFinished();
    });
  });
});
