'use strict';

module.exports = {
  normalizeEntityName: function() {},
  afterInstall: function() {
    return this.addBowerPackageToProject('localforage', '~1.2.1');
  }
};