const { debuglog } = require('util');
let { MockAgent, setGlobalDispatcher, getGlobalDispatcher } = require('urllib');
if (typeof getGlobalDispatcher === 'undefined') {
  let urllibNext;
  // https://github.com/eggjs/egg/blob/3.x/package.json#L59
  try {
    // try to use urllib4
    urllibNext = require('urllib4');
  } catch {
    // try to use urllib-next
    try {
      urllibNext = require('urllib-next');
    } catch {
      throw new Error('Please install urllib@4');
    }
  }
  MockAgent = urllibNext.MockAgent;
  setGlobalDispatcher = urllibNext.setGlobalDispatcher;
  getGlobalDispatcher = urllibNext.getGlobalDispatcher;
}

const debug = debuglog('egg-mock:lib:mock_agent');

let _mockAgent;
let _global;
const APP_HTTPCLIENT_AGENT = Symbol('app.httpclient.agent');
const httpClients = [];

module.exports = {
  getAgent(app) {
    if (!_global) {
      _global = getGlobalDispatcher();
    }
    if (!app?.httpclient?.[APP_HTTPCLIENT_AGENT] && typeof app?.httpclient?.getDispatcher === 'function') {
      // save the raw dispatcher
      app.httpclient[APP_HTTPCLIENT_AGENT] = app.httpclient.getDispatcher();
      httpClients.push(app.httpclient);
      debug('add new httpClient, size: %d', httpClients.length);
    }
    if (!_mockAgent) {
      _mockAgent = new MockAgent();
      setGlobalDispatcher(_mockAgent);
      if (typeof app?.httpclient?.setDispatcher === 'function') {
        app.httpclient.setDispatcher(_mockAgent);
      }
    }
    return _mockAgent;
  },
  async restore() {
    if (!_mockAgent) return;
    if (_global) {
      setGlobalDispatcher(_global);
    }
    for (const httpClient of httpClients) {
      httpClient.setDispatcher(httpClient[APP_HTTPCLIENT_AGENT]);
    }
    debug('restore httpClient, size: %d', httpClients.length);
    const agent = _mockAgent;
    _mockAgent = null;
    await agent.close();
  },
};
