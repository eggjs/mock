const debug = require('util').debuglog('egg-mock:register');
const mock = require('./index').default;
const agentHandler = require('./lib/agent_handler');
const appHandler = require('./lib/app_handler');
const injectContext = require('./lib/inject_context');

exports.mochaGlobalSetup = async () => {
  debug('mochaGlobalSetup, agent.setupAgent() start');
  await agentHandler.setupAgent();
  debug('mochaGlobalSetup, agent.setupAgent() end');
};

exports.mochaGlobalTeardown = async () => {
  debug('mochaGlobalTeardown, agent.closeAgent() start');
  await agentHandler.closeAgent();
  debug('mochaGlobalTeardown, agent.closeAgent() end');
};

exports.mochaHooks = {
  async beforeAll() {
    const app = await appHandler.getApp();
    debug('mochaHooks.beforeAll call, _app: %s', app);
    if (app) {
      await app.ready();
    }
  },
  async afterEach() {
    const app = await appHandler.getApp();
    debug('mochaHooks.afterEach call, _app: %s', app);
    if (app) {
      await app.backgroundTasksFinished();
    }
    await mock.restore();
  },
  async afterAll() {
    // skip auto app close on parallel
    if (process.env.ENABLE_MOCHA_PARALLEL) return;
    const app = await appHandler.getApp();
    debug('mochaHooks.afterAll call, _app: %s', app);
    if (app) {
      await app.close();
    }
  },
};

/**
 * Find active node mocha instances.
 *
 * @return {Array}
 */
function findNodeJSMocha() {
  const children = require.cache || {};

  return Object.keys(children)
    .filter(function(child) {
      const val = children[child].exports;
      return typeof val === 'function' && val.name === 'Mocha';
    })
    .map(function(child) {
      return children[child].exports;
    });
}

require('mocha');
const modules = findNodeJSMocha();

for (const module of modules) {
  injectContext(module);
}

