const util = require('util');
const { rm } = require('fs/promises');
const { rmSync } = require('fs');
const is = require('is-type-of');

const setTimeoutPromise = util.promisify(setTimeout);

module.exports = {
  async sleep(delay) {
    await setTimeoutPromise(delay);
  },

  async rimraf(filepath) {
    await rm(filepath, { force: true, recursive: true });
  },

  rimrafSync(filepath) {
    rmSync(filepath, { force: true, recursive: true });
  },

  getProperty(target, prop) {
    const member = target[prop];
    if (is.function(member)) {
      return member.bind(target);
    }
    return member;
  },
  getEggOptions() {
    const options = {};

    if (process.env.EGG_BASE_DIR) {
      options.baseDir = process.env.EGG_BASE_DIR;
    } else {
      options.baseDir = process.cwd();
    }
    if (process.env.EGG_FRAMEWORK) {
      options.framework = process.env.EGG_FRAMEWORK;
    }
    return options;
  },
};
