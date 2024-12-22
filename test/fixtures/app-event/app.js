const { scheduler } = require('node:timers/promises');

module.exports = app => {
  app.ready(() => {
    // after ready
    app.emit('appReady');
  });

  process.nextTick(() => {
    // before ready, after app instantiate
    app.emit('appInstantiated');
  });

  app.beforeStart(async function() {
    await scheduler.wait(1000);
  });
};
