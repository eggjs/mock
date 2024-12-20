import { debuglog } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { Base } from 'sdk-base';
import { detectPort } from 'detect-port';
import type { Agent, Application } from 'egg';
import { importModule } from '@eggjs/utils';
import { sleep, rimraf, getProperty } from './utils.js';
import { formatOptions } from './format_options.js';
import context from './context.js';
import mockCustomLoader from './mock_custom_loader.js';
import mockHttpServer from './mock_http_server.js';
import type { MockOptions, MockApplicationOptions } from './types.js';

const debug = debuglog('egg-mock:lib:app');

const apps = new Map();
const APP_INIT = Symbol('appInit');
const MESSENGER = Symbol('messenger');
const MOCK_APP_METHOD = [
  'ready',
  'closed',
  'close',
  '_agent',
  '_app',
  'on',
  'once',
  'then',
];

export class MockApplication extends Base {
  _agent: Agent;
  _app: Application;
  declare options: MockApplicationOptions;
  baseDir: string;
  closed = false;
  [APP_INIT] = false;
  #initOnListeners = new Set<any[]>();
  #initOnceListeners = new Set<any[]>();

  constructor(options: MockApplicationOptions) {
    super({
      initMethod: '_init',
      ...options,
    });
    this.baseDir = options.baseDir;
    // listen once, otherwise will throw exception when emit error without listener
    // this.once('error', () => {});
  }

  async _init() {
    if (this.options.beforeInit) {
      await this.options.beforeInit(this);
      // init once
      this.options.beforeInit = undefined;
    }
    if (this.options.clean !== false) {
      const logDir = path.join(this.options.baseDir, 'logs');
      try {
        if (os.platform() === 'win32') await sleep(1000);
        await rimraf(logDir);
      } catch (err: any) {
        console.error(`remove log dir ${logDir} failed: ${err.stack}`);
      }
    }

    this.options.clusterPort = await detectPort();
    debug('get clusterPort %s', this.options.clusterPort);
    const egg = await importModule(this.options.framework);

    const Agent = egg.Agent;
    const agent = this._agent = new Agent({ ...this.options }) as Agent;
    debug('agent instantiate');
    await agent.ready();
    debug('agent ready');

    const ApplicationClass = bindMessenger(egg.Application, agent);
    const app = this._app = new ApplicationClass({ ...this.options }) as Application;

    // https://github.com/eggjs/egg/blob/8bb7c7e7d59d6aeca4b2ed1eb580368dcb731a4d/lib/egg.js#L125
    // egg single mode mount this at start(), so egg-mock should impel it.
    app.agent = agent;
    Reflect.set(agent, 'app', app);

    // egg-mock plugin need to override egg context
    Object.assign(app.context, context);

    debug('app instantiate');
    this[APP_INIT] = true;
    debug('this[APP_INIT] = true');
    this.#bindEvent();
    debug('http server instantiate');
    mockHttpServer(app);
    await app.ready();
    // work for config ready
    mockCustomLoader(app);

    const msg = {
      action: 'egg-ready',
      data: this.options,
    };
    app.messenger.onMessage(msg);
    agent.messenger.onMessage(msg);
    debug('app ready');
  }

  #bindEvent() {
    for (const args of this.#initOnListeners) {
      debug('on(%s), use cache and pass to app', args);
      this._app.on(args[0], args[1]);
      this.removeListener(args[0], args[1]);
    }
    for (const args of this.#initOnceListeners) {
      debug('once(%s), use cache and pass to app', args);
      this._app.on(args[0], args[1]);
      this.removeListener(args[0], args[1]);
    }
  }

  on(...args: any[]) {
    if (this[APP_INIT]) {
      debug('on(%s), pass to app', args);
      this._app.on(args[0], args[1]);
    } else {
      debug('on(%s), cache it because app has not init', args);
      this.#initOnListeners.add(args);
      super.on(args[0], args[1]);
    }
    return this;
  }

  once(...args: any[]) {
    if (this[APP_INIT]) {
      debug('once(%s), pass to app', args);
      this._app.once(args[0], args[1]);
    } else {
      debug('once(%s), cache it because app has not init', args);
      this.#initOnceListeners.add(args);
      super.once(args[0], args[1]);
    }
    return this;
  }

  /**
   * close app
   * @return {Promise} promise
   */
  async close(): Promise<void> {
    this.closed = true;
    const self = this;
    const baseDir = this.baseDir;
    if (self._app) {
      await self._app.close();
    } else {
      // when app init throws an exception, must wait for app quit gracefully
      await sleep(200);
    }

    if (self._agent) {
      await self._agent.close();
    }

    apps.delete(baseDir);
    debug('delete app cache %s, remain %s', baseDir, [ ...apps.keys() ]);

    if (os.platform() === 'win32') {
      await sleep(1000);
    }
  }
}

export function createApp(options: MockOptions) {
  options = formatOptions(options);
  if (options.cache && apps.has(options.baseDir)) {
    const app = apps.get(options.baseDir);
    // return cache when it hasn't been killed
    if (!app.closed) {
      return app;
    }
    // delete the cache when it's closed
    apps.delete(options.baseDir);
  }

  let app = new MockApplication(options);
  app = new Proxy(app, {
    get(target, prop) {
      // don't delegate properties on MockApplication
      if (MOCK_APP_METHOD.includes(prop)) {
        return getProperty(target, prop);
      }
      if (!target[APP_INIT]) throw new Error(`can't get ${prop} before ready`);
      // it's asynchronous when agent and app are loading,
      // so should get the properties after loader ready
      debug('proxy handler.get %s', prop);
      return target._app[prop];
    },
    set(target, prop, value) {
      if (MOCK_APP_METHOD.includes(prop)) return true;
      if (!target[APP_INIT]) throw new Error(`can't set ${prop} before ready`);
      debug('proxy handler.set %s', prop);
      target._app[prop] = value;
      return true;
    },
    defineProperty(target, prop, descriptor) {
      // can't define properties on MockApplication
      if (MOCK_APP_METHOD.includes(prop)) return true;
      if (!target[APP_INIT]) throw new Error(`can't defineProperty ${prop} before ready`);
      debug('proxy handler.defineProperty %s', prop);
      Object.defineProperty(target._app, prop, descriptor);
      return true;
    },
    deleteProperty(target, prop) {
      // can't delete properties on MockApplication
      if (MOCK_APP_METHOD.includes(prop)) return true;
      if (!target[APP_INIT]) throw new Error(`can't delete ${prop} before ready`);
      debug('proxy handler.deleteProperty %s', prop);
      delete target._app[prop];
      return true;
    },
    getOwnPropertyDescriptor(target, prop) {
      if (MOCK_APP_METHOD.includes(prop)) return Object.getOwnPropertyDescriptor(target, prop);
      if (!target[APP_INIT]) throw new Error(`can't getOwnPropertyDescriptor ${prop} before ready`);
      debug('proxy handler.getOwnPropertyDescriptor %s', prop);
      return Object.getOwnPropertyDescriptor(target._app, prop);
    },
    getPrototypeOf(target) {
      if (!target[APP_INIT]) throw new Error('can\'t getPrototypeOf before ready');
      debug('proxy handler.getPrototypeOf %s');
      return Object.getPrototypeOf(target._app);
    },
  });

  apps.set(options.baseDir, app);
  return app;
}

function bindMessenger(Application, agent) {
  const agentMessenger = agent.messenger;
  return class MessengerApplication extends Application {
    constructor(options) {
      super(options);

      // enable app to send to a random agent
      this.messenger.sendRandom = (action, data) => {
        this.messenger.sendToAgent(action, data);
      };
      // enable agent to send to a random app
      agentMessenger.on('egg-ready', () => {
        agentMessenger.sendRandom = (action, data) => {
          agentMessenger.sendToApp(action, data);
        };
      });

      agentMessenger.send = new Proxy(agentMessenger.send, {
        apply: this._sendMessage.bind(this),
      });
    }
    _sendMessage(target, thisArg, [ action, data, to ]) {
      const appMessenger = this.messenger;
      setImmediate(() => {

        if (to === 'app') {
          appMessenger.onMessage({ action, data });
        } else {
          agentMessenger.onMessage({ action, data });
        }
      });
    }
    get messenger() {
      return this[MESSENGER];
    }
    set messenger(m) {
      m.send = new Proxy(m.send, {
        apply: this._sendMessage.bind(this),
      });
      this[MESSENGER] = m;
    }

    get [Symbol.for('egg#eggPath')]() {
      return path.join(__dirname, 'tmp');
    }
  };
}
