import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import LFCache from 'ember-localforage-adapter/utils/cache';

var App;
var cache;
var run = Ember.run;

var FIXTURES = [{
  id: 1,
  name: "test"
}];

module('Cache helper', {
  beforeEach: function () {
    cache = LFCache.create();

    run(function () {
      App = startApp();
    });
  },

  afterEach: function () {
    destroyApp(App);
  }
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