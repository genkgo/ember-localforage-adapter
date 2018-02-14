/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-localforage-adapter',
  included: function included(app) {
    this._super.included(app);
    //app.import(app.bowerDirectory + '/localforage/dist/localforage.js');
  }
};
