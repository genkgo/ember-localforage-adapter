import { moduleFor, test } from 'ember-qunit';

// The default (application) adapter is the DRF adapter.
// see app/adapters/application.js
moduleFor('adapter:localforage', 'LocalforageAdapter', {
  // The integration tests don't work with the host set so the host
  // setting is being overridden directly.
  subject: function(options, factory) {
    return factory.create({host: 'test-host'});
  }

});
