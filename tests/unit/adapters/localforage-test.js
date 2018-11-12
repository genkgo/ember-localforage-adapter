import { module } from 'qunit';
import { setupTest } from 'ember-qunit';

module('LocalforageAdapter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // The integration tests don't work with the host set so the host
    // setting is being overridden directly.
    this.subject = function(options, factory) {
      return factory.create({host: 'test-host'});
    };
  });
});
