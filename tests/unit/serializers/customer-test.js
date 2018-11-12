import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('serializer:customer', function(hooks) {
  setupTest(hooks);

  test("it is set up with embedded:always style for the 'addresses' relation", function(assert) {
    var serializer = this.owner.lookup('serializer:customer');
    assert.ok(serializer.hasEmbeddedAlwaysOption('addresses'), 'addresses relation is not set up with embedded:always style');
  });

  test("it is not set up with embedded:always style for the 'foo' relation", function(assert) {
    var serializer = this.owner.lookup('serializer:customer');
    assert.ok(!serializer.hasEmbeddedAlwaysOption('foo'), 'foo relation is unexpectedly set up with embedded:always style');
  });
});

