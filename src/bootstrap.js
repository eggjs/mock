const assert = require('assert');
const path = require('path');
const mock = require('./index').default;
const appHandler = require('./lib/app_handler');

const { getEggOptions } = require('./lib/utils');

const options = getEggOptions();

// throw error when an egg plugin test is using bootstrap
const pkgInfo = require(path.join(options.baseDir || process.cwd(), 'package.json'));
if (pkgInfo.eggPlugin) throw new Error('DO NOT USE bootstrap to test plugin');

appHandler.setupApp();

module.exports = {
  assert,
  get app() {
    return appHandler.getBootstrapApp();
  },
  mock,
  mm: mock,
};
