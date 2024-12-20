const mm = require('mm');
const mockHttpclient = require('../../lib/mock_httpclient');
const mockAgent = require('../../lib/mock_agent');

module.exports = {
  /**
   * mock httpclient
   * @function Agent#mockHttpclient
   * @param {...any} args - args
   * @return {Context} this
   */
  mockHttpclient(...args) {
    if (!this._mockHttpclient) {
      this._mockHttpclient = mockHttpclient(this);
    }
    return this._mockHttpclient(...args);
  },

  /**
   * get mock httpclient agent
   * @function Agent#mockHttpclientAgent
   * @return {MockAgent} agent
   */
  mockAgent() {
    return mockAgent.getAgent(this);
  },

  async mockAgentRestore() {
    await mockAgent.restore();
  },

  /**
   * @see mm#restore
   * @function Agent#mockRestore
   */
  mockRestore: mm.restore,

  /**
   * @see mm
   * @function Agent#mm
   */
  mm,
};
