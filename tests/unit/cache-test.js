import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import LFCache from 'ember-localforage-adapter/utils/cache';

var App;
var cache;

var FIXTURES = [{
  id: 1,
  name: "test"
}];

module('Cache helper', function(hooks) {
  hooks.beforeEach(function () {
    cache = LFCache.create();

    run(function () {
      App = startApp();
    });
  });

  hooks.afterEach(function () {
    destroyApp(App);
  });

  test('cache set/get', function (assert) {
    assert.expect(2);

    run(function () {
      cache.set('modelname', {
        a: 'b',
        b: 'c'
      });

      assert.equal('b', cache.get('modelname').a);
      assert.equal('c', cache.get('modelname').b);
    });
  });

  test('cache clear', function (assert) {
    assert.expect(1);

    run(function () {
      cache.set('modelname', FIXTURES);
      cache.clear();

      assert.deepEqual(null, cache.get('modelname'));
    });
  });
});