import mm from 'mm';
import cluster from './lib/cluster.js';
import app from './lib/app.js';
import mockAgent from './lib/mock_agent.js';
import { restore } from './lib/restore.js';
import { setGetAppCallback } from './lib/app_handler.js';

// egg-bin will set this flag to require files for instrument
// if (process.env.EGG_BIN_PREREQUIRE) {
//   require('./lib/prerequire');
// }

// inherit & extends mm
const mock = {
  ...mm,
  restore,

  /**
   * Create a egg mocked application
   * @function mm#app
   * @param {Object} [options]
   * - {String} baseDir - The directory of the application
   * - {Object} plugins - Tustom you plugins
   * - {String} framework - The directory of the egg framework
   * - {Boolean} [true] cache - Cache application based on baseDir
   * - {Boolean} [true] coverage - Swtich on process coverage, but it'll be slower
   * - {Boolean} [true] clean - Remove $baseDir/logs
   * @return {App} return {@link Application}
   * @example
   * ```js
   * var app = mm.app();
   * ```
   */
  app,

  /**
   * Create a egg mocked cluster application
   * @function mm#cluster
   * @see ClusterApplication
   */
  cluster,

  /**
   * mock the serverEnv of Egg
   * @member {Function} mm#env
   * @param {String} env - contain default, test, prod, local, unittest
   * @see https://github.com/eggjs/egg-core/blob/master/lib/loader/egg_loader.js#L78
   */
  env(env: string) {
    mm(process.env, 'EGG_MOCK_SERVER_ENV', env);
    mm(process.env, 'EGG_SERVER_ENV', env);
  },

  /**
   * mock console level
   * @param {String} level - logger level
   */
  consoleLevel(level: string) {
    level = (level || '').toUpperCase();
    mm(process.env, 'EGG_LOG', level);
  },

  home(homePath: string) {
    if (homePath) {
      mm(process.env, 'EGG_HOME', homePath);
    }
  },

  setGetAppCallback,
};

export default mock;
export {
  mock,
  // alias to mm
  mock as mm,
};

process.setMaxListeners(100);

process.once('SIGQUIT', () => {
  process.exit(0);
});

process.once('SIGTERM', () => {
  process.exit(0);
});

process.once('SIGINT', () => {
  process.exit(0);
});
