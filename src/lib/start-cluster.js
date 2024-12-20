#!/usr/bin/env node

const { debuglog } = require('node:util');

const debug = debuglog('egg-mock/start-cluster');

if (process.env.EGG_BIN_PREREQUIRE) {
  require('./prerequire');
}

const options = JSON.parse(process.argv.slice(2));
debug('startCluster with options: %o', options);
require(options.framework).startCluster(options);
