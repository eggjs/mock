import { debuglog } from 'node:util';
import {
  MockAgent, setGlobalDispatcher, getGlobalDispatcher, Dispatcher,
  HttpClient,
} from 'urllib';

const debug = debuglog('@eggjs/mock/lib/mock_agent');

let _mockAgent: MockAgent | null = null;
let _global: Dispatcher;
const httpClientDispatchers = new Map<HttpClient, Dispatcher>();

export function getMockAgent(app?: { httpclient?: HttpClient }) {
  if (!_global) {
    _global = getGlobalDispatcher();
  }
  if (app?.httpclient && !httpClientDispatchers.has(app.httpclient)) {
    httpClientDispatchers.set(app.httpclient, app.httpclient.getDispatcher());
    debug('add new httpClient, size: %d', httpClientDispatchers.size);
  }
  if (!_mockAgent) {
    _mockAgent = new MockAgent();
    setGlobalDispatcher(_mockAgent);
    if (typeof app?.httpclient?.setDispatcher === 'function') {
      app.httpclient.setDispatcher(_mockAgent);
    }
  }
  return _mockAgent;
}

export async function restoreMockAgent() {
  if (!_mockAgent) return;
  if (_global) {
    setGlobalDispatcher(_global);
  }
  for (const [ httpClient, dispatcher ] of httpClientDispatchers) {
    httpClient.setDispatcher(dispatcher);
  }
  debug('restore httpClient, size: %d', httpClientDispatchers.size);
  const agent = _mockAgent;
  _mockAgent = null;
  await agent.close();
}
