const assert = require('assert');
const debug = require('util').debuglog('egg-mock:inject_context');
const MOCHA_SUITE_APP = Symbol.for('mocha#suite#app');
const appHandler = require('./app_handler');

/**
 * Monkey patch the mocha instance with egg context.
 *
 * @param {Function} mocha -
 */
function injectContext(mocha) {
  if (!mocha || mocha._injectContextLoaded) {
    return;
  }

  const { Runner } = mocha;
  const runSuite = Runner.prototype.runSuite;
  const runTests = Runner.prototype.runTests;

  function getTestTitle(suite, test) {
    const suiteTitle = suite.root ? 'root suite' : suite.title;
    if (!test) {
      return `"${suiteTitle}"`;
    }
    return `"${suiteTitle} - ${test.title}"`;
  }

  // Inject ctx for before/after.
  Runner.prototype.runSuite = async function(suite, fn) {
    debug('run suite: %s', suite.title);
    let app;
    const self = this;
    try {
      app = await appHandler.getApp(suite);
      debug('get app: %s', !!app);
      await app.ready();
    } catch {
      // 可能 app.ready 时报错，不使用失败的 app
      app = null;
    }
    if (!app) {
      // app 不存在，直接跳过，在 beforeEach 的 hook 中会报错
      // 确保不打乱 mocha 的顺序，防止 mocha 内部状态错误
      return runSuite.call(self, suite, fn);
    }
    let errSuite;
    try {
      suite.ctx[MOCHA_SUITE_APP] = app;
      const mockContextFun = app.mockModuleContextScope || app.mockContextScope;
      await mockContextFun.call(app, async function() {
        await new Promise(resolve => {
          runSuite.call(self, suite, aErrSuite => {
            errSuite = aErrSuite;
            resolve();
          });
        });
      });
    } catch (err) {
      // mockContext 失败后动态注册一个 beforeAll hook
      // 快速失败，直接阻塞后续用例
      suite.beforeAll('egg-mock-mock-ctx-failed', async () => {
        throw err;
      });
      return runSuite.call(self, suite, aErrSuite => {
        return fn(aErrSuite);
      });
    }
    return fn(errSuite);
  };

  // Inject ctx for beforeEach/it/afterEach.
  // And ctx with before/after is not same as beforeEach/it/afterEach.
  Runner.prototype.runTests = async function(suite, fn) {
    const tests = suite.tests.slice();
    if (!tests.length) {
      return runTests.call(this, suite, fn);
    }

    const app = suite.ctx[MOCHA_SUITE_APP];

    const self = this;
    if (!app) {
      return runTests.call(self, suite, fn);
    }

    function done(errSuite) {
      suite.tests = tests;
      return fn(errSuite);
    }

    async function next(i) {
      const test = tests[i];
      if (!test) {
        return done();
      }
      suite.tests = [ test ];

      let app;
      try {
        app = await appHandler.getApp(suite, test);
        assert(app, `not found app for test ${getTestTitle(suite, test)}`);
        await app.ready();
      } catch (err) {
        self.fail(test, err);
        return next(i + 1);
      }

      try {
        const mockContextFun = app.mockModuleContextScope || app.mockContextScope;
        await mockContextFun.call(app, async function() {
          return await new Promise(resolve => {
            runTests.call(self, suite, () => {
              return resolve();
            });
          });
        });
      } catch (err) {
        self.fail(test, err);
        return next(i + 1);
      }
      return next(i + 1);
    }
    next(0).catch(err => {
      self.fail(suite, err);
      done(suite);
    });
  };

  mocha._injectContextLoaded = true;
}

module.exports = injectContext;
