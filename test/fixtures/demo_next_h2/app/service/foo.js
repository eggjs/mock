'use strict';

module.exports = function(app) {
  class Foo extends app.Service {
    * get() {
      return 'bar';
    }

    getSync() {
      return 'bar';
    }
  }

  return Foo;
};
