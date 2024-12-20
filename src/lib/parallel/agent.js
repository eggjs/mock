const debug = require('util').debuglog('egg-mock:lib:parallel:agent');
const path = require('path');
const Base = require('sdk-base');
const { detectPort } = require('detect-port');
const context = require('../context');
const formatOptions = require('../format_options');
const { sleep, rimraf } = require('../utils');
const mockCustomLoader = require('../mock_custom_loader');
const {
  APP_INIT,
  INIT_ONCE_LISTENER,
  INIT_ON_LISTENER,
  BIND_EVENT,
  consoleLogger,
} = require('./util');

class MockAgent extends Base {
  constructor(options) {
    super({ initMethod: '_init' });
    this.options = options;
    this.baseDir = options.baseDir;
    this.closed = false;
    this[APP_INIT] = false;
    this[INIT_ON_LISTENER] = new Set();
    this[INIT_ONCE_LISTENER] = new Set();
    // listen once, otherwise will throw exception when emit error without listenr
    this.once('error', err => {
      consoleLogger.error(err);
    });
  }

  async _init() {
    if (this.options.beforeInit) {
      await this.options.beforeInit(this);
      delete this.options.beforeInit;
    }
    if (this.options.clean !== false) {
      const logDir = path.join(this.options.baseDir, 'logs');
      try {
        await rimraf(logDir);
      } catch (err) {
        /* istanbul ignore next */
        console.error(`remove log dir ${logDir} failed: ${err.stack}`);
      }
    }

    this.options.clusterPort = process.env.CLUSTER_PORT = await detectPort();
    debug('get clusterPort %s', this.options.clusterPort);
    const { Agent } = require(this.options.framework);

    const agent = this._instance = new Agent(Object.assign({}, this.options));

    // egg-mock plugin need to override egg context
    Object.assign(agent.context, context);
    mockCustomLoader(agent);

    debug('agent instantiate');
    this[APP_INIT] = true;
    debug('this[APP_INIT] = true');
    this[BIND_EVENT]();
    await agent.ready();

    const msg = {
      action: 'egg-ready',
      data: this.options,
    };
    agent.messenger.onMessage(msg);
    debug('agent ready');
  }

  [BIND_EVENT]() {
    for (const args of this[INIT_ON_LISTENER]) {
      debug('on(%s), use cache and pass to app', args);
      this._instance.on(...args);
      this.removeListener(...args);
    }
    for (const args of this[INIT_ONCE_LISTENER]) {
      debug('once(%s), use cache and pass to app', args);
      this._instance.on(...args);
      this.removeListener(...args);
    }
  }

  on(...args) {
    if (this[APP_INIT]) {
      debug('on(%s), pass to app', args);
      this._instance.on(...args);
    } else {
      debug('on(%s), cache it because app has not init', args);
      if (this[INIT_ON_LISTENER]) {
        this[INIT_ON_LISTENER].add(args);
      }
      super.on(...args);
    }
  }

  once(...args) {
    if (this[APP_INIT]) {
      debug('once(%s), pass to app', args);
      this._instance.once(...args);
    } else {
      debug('once(%s), cache it because app has not init', args);
      if (this[INIT_ONCE_LISTENER]) {
        this[INIT_ONCE_LISTENER].add(args);
      }
      super.on(...args);
    }
  }

  /**
   * close app
   * @return {Promise} promise
   */
  async close() {
    this.closed = true;
    const self = this;
    if (self._instance) {
      await self._instance.close();
    } else {
      // when app init throws an exception, must wait for app quit gracefully
      await sleep(200);
    }
  }
}

module.exports = function(options) {
  options = formatOptions(options);

  return new MockAgent(options);
};
