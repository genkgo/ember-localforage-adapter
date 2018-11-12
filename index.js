'use strict';

module.exports = {
  name: require('./package').name,
  included() {
    this._super.included.apply(this, arguments);
    this.import('node_modules/localforage/dist/localforage.js');
    this.import('vendor/shim.js');
  }
};
