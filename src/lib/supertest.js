'use strict';

const methods = require('methods');
const EggTest = require('./http_test');
const mockHttpServer = require('./mock_http_server');
const pkg = require('../package.json');

// patch from https://github.com/visionmedia/supertest/blob/199506d8dbfe0bb1434fc07c38cdcd1ab4c7c926/index.js#L19

/**
 * Test against the given `app`,
 * returning a new `Test`.
 *
 * @param {Application} app
 * @return {Test}
 * @public
 */

module.exports = app => {
  const server = mockHttpServer(app);
  const obj = {};
  for (const method of methods) {
    obj[method] = url => {
      // support pathFor(url)
      if (url[0] !== '/') {
        const realUrl = app.router.pathFor(url);
        if (!realUrl) throw new Error(`Can\'t find router:${url}, please check your \'app/router.js\'`);
        url = realUrl;
      }

      const eggTest = new EggTest(server, method, url);
      eggTest.set('user-agent', `egg-mock/${pkg.version}`);
      return eggTest;
    };
  }
  obj.del = obj.delete;
  return obj;
};
