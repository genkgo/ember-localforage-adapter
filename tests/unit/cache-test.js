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

//test('cache uses copies when using set', function (assert) {
//  assert.expect(2);
//
//  run(function () {
//    cache.set('modelname', FIXTURES);
//
//    var cacheResponse = cache.get('modelname');
//
//    assert.deepEqual(FIXTURES[0], cacheResponse[0]);
//    assert.notStrictEqual(FIXTURES[0], cacheResponse[0]);
//  });
//});
//
//test('cache uses copies when using replace', function (assert) {
//  assert.expect(3);
//
//  run(function () {
//    var replacement = {
//      "modelname": [{
//        id: 1,
//        name: "replace"
//      }]
//    };
//
//    cache.set('modelname', FIXTURES);
//    cache.replace(replacement);
//
//    var cacheResponse = cache.get('modelname');
//    var replaceResponse = replacement["modelname"];
//
//    assert.deepEqual(replaceResponse[0], cacheResponse[0]);
//    assert.notStrictEqual(replaceResponse[0], cacheResponse[0]);
//    assert.notDeepEqual(FIXTURES[0], cacheResponse[0]);
//  });
//});

test('cache clear', function (assert) {
  assert.expect(1);

  run(function () {
    cache.set('modelname', FIXTURES);
    cache.clear();

    assert.deepEqual(null, cache.get('modelname'));
  });
});