import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('serializer:customer', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
});

test('it is set up with embedded:always style for the addresses relation', function(assert) {
  var serializer = this.subject();
  assert.ok(serializer.hasEmbeddedAlwaysOption('addresses'), 'addresses relation is not set up with embedded:always style');
});
