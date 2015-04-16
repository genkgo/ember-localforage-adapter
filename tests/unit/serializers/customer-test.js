import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('serializer:customer', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
});

test('it exists', function(assert) {
  var serializer = this.subject();
  assert.ok(serializer);
});
