const debug = require('util').debuglog('egg-mock:bootstrap:app_handler');
const mockParallelApp = require('./parallel/app');
const { setupAgent } = require('./agent_handler');
const mock = require('../index').default;
const { getEggOptions } = require('./utils');

let app;

exports.setupApp = () => {
  if (app) {
    debug('return exists app');
    return app;
  }

  const options = getEggOptions();
  debug('env.ENABLE_MOCHA_PARALLEL: %s, process.env.AUTO_AGENT: %s',
    process.env.ENABLE_MOCHA_PARALLEL, process.env.AUTO_AGENT);
  if (process.env.ENABLE_MOCHA_PARALLEL && process.env.AUTO_AGENT) {
    // setup agent first
    app = mockParallelApp({
      ...options,
      beforeInit: async _app => {
        const agent = await setupAgent();
        _app.options.clusterPort = agent.options.clusterPort;
        debug('mockParallelApp beforeInit get clusterPort: %s', _app.options.clusterPort);
      },
    });
    debug('mockParallelApp app: %s', !!app);
  } else {
    app = mock.app(options);
    if (typeof beforeAll === 'function') {
      // jest
      beforeAll(() => app.ready());
      afterEach(() => app.backgroundTasksFinished());
      afterEach(mock.restore);
    }
  }
};

let getAppCallback;

exports.setGetAppCallback = cb => {
  getAppCallback = cb;
};

exports.getApp = async (suite, test) => {
  if (getAppCallback) {
    return getAppCallback(suite, test);
  }
  if (app) {
    await app.ready();
  }
  return app;
};

exports.getBootstrapApp = () => {
  return app;
};
