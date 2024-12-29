import { app, assert, mm, mock } from '../src/bootstrap.js';
import { getFixtures } from './helper.js';

// TBD: This test case is not working as expected. Need to investigate.
describe.skip('test/bootstrap.test.ts', () => {
  const baseDir = process.env.EGG_BASE_DIR = getFixtures('app');

  it('should create app success', () => {
    assert(app.baseDir === baseDir);
  });

  it('should mock and mm success', () => {
    assert(app.baseDir === baseDir);
    mm(app, 'baseDir', 'foo');
    assert(app.baseDir === 'foo');
    mock(app, 'baseDir', 'bar');
    // assert(app.baseDir === 'bar');
  });

  it('should afterEach(mm.restore) success', () => {
    assert(app.baseDir === baseDir);
  });

  it('should assert success', done => {
    try {
      assert(app.baseDir !== baseDir);
    } catch (err) {
      done();
    }
  });

  describe('backgroundTasksFinished()', () => {
    it('should wait for background task 1 finished', function* () {
      yield app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 0 });
      yield app.httpRequest()
        .get('/counter/plus')
        .expect(200)
        .expect({ counter: 0 });
    });

    it('should wait for background task 2 finished', function* () {
      yield app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 1 });
      yield app.httpRequest()
        .get('/counter/minus')
        .expect(200)
        .expect({ counter: 1 });
    });

    it('should wait for background task 3 finished', function* () {
      yield app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 0 });
      app.mockContext({ superMan: true });
      yield app.httpRequest()
        .get('/counter/plus')
        .expect(200)
        .expect({ counter: 0 });
    });

    it('should wait for background task 4 finished', function* () {
      yield app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 10 });
      yield app.httpRequest()
        .get('/counter/plusplus')
        .expect(200)
        .expect({ counter: 10 });
    });

    it('should wait for background task 5 finished', function* () {
      yield app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 12 });
      app.mockContext({ superMan: true });
      yield app.httpRequest()
        .get('/counter/plusplus')
        .expect(200)
        .expect({ counter: 12 });
    });

    it('should all reset', function* () {
      yield app.httpRequest()
        .get('/counter')
        .expect(200)
        .expect({ counter: 32 });
    });

    it('should always return promise instance', () => {
      let p = app.backgroundTasksFinished();
      assert(p.then);
      p = app.backgroundTasksFinished();
      assert(p.then);
      p = app.backgroundTasksFinished();
      assert(p.then);
    });
  });
});
