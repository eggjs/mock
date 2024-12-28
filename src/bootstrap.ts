import { strict as assert } from 'node:assert';
import path from 'node:path';
import { readJSONSync } from 'utility';
import mm, { mock } from './index.js';
import { getBootstrapApp, setupApp } from './lib/app_handler.js';
import { getEggOptions } from './lib/utils.js';

const options = getEggOptions();

// throw error when an egg plugin test is using bootstrap
const pkgInfo = readJSONSync(path.join(options.baseDir || process.cwd(), 'package.json'));
if (pkgInfo.eggPlugin) {
  throw new Error('DO NOT USE bootstrap to test plugin');
}

setupApp();

const app = getBootstrapApp();

export {
  assert,
  app,
  mm,
  mock,
};