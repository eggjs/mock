module.exports = function(app) {
  class Foo extends app.Service {
    async get() {
      return 'bar';
    }
  }

  return Foo;
};