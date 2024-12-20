import { debuglog } from 'node:util';
import mockParallelApp from './parallel/app.js';
import { setupAgent } from './agent_handler.js';
import { createApp } from './app.js';
import { restore } from './restore.js';
import { getEggOptions } from './utils.js';
import Application from '../app/extend/application.js';

const debug = debuglog('@eggjs/mock/lib/app_handler');

let app: Application;

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
    app = createApp(options);
    if (typeof beforeAll === 'function') {
      // jest
      beforeAll(() => app.ready());
      afterEach(() => app.backgroundTasksFinished());
      afterEach(restore);
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
