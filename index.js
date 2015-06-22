/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-localforage-adapter',
  included: function included(app) {
    this._super.included.apply(this, arguments);
    if (app.app) {
      app = app.app;
    }
    this.app = app;
    app.import(app.bowerDirectory + '/localforage/dist/localforage.js');
  }
};
