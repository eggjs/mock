#!/usr/bin/env node

import { debuglog } from 'node:util';
import { importModule } from '@eggjs/utils';

const debug = debuglog('@eggjs/mock/lib/start-cluster');

// if (process.env.EGG_BIN_PREREQUIRE) {
//   require('./prerequire');
// }

async function main() {
  const options = JSON.parse(process.argv[2]);
  debug('startCluster with options: %o', options);
  const { startCluster } = await importModule(options.framework);
  await startCluster(options);
}

main();
