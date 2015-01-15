import Ember from 'ember';
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';
import LFCache from 'ember-localforage-adapter/utils/cache';

var App;
var cache;
var run = Ember.run;
var get = Ember.get;
var set = Ember.set;
var guidFor = Ember.guidFor;

var FIXTURES = [{
    id : 1,
    name: "test"
}];

module('Cache helper', {
    setup: function() {
        cache = LFCache.create();

        run(function () {
            App = startApp();
        });
    },

    teardown: function() {
        run(App, 'destroy');
    }
});

test('cache uses copies when using set', function() {
    expect(2);
    stop();

    run(function() {
        cache.set('modelname', FIXTURES);

        var cacheResponse = cache.get('modelname');

        deepEqual(FIXTURES[0], cacheResponse[0]);
        notStrictEqual(FIXTURES[0], cacheResponse[0]);
        start();
    });
});

test('cache uses copies when using replace', function() {
    expect(3);
    stop();

    run(function() {
        var replacement = {
            "modelname": [{
                id : 1,
                name: "replace"
            }]
        };

        cache.set('modelname', FIXTURES);
        cache.replace(replacement);

        var cacheResponse = cache.get('modelname');
        var replaceResponse = replacement["modelname"];

        deepEqual(replaceResponse[0], cacheResponse[0]);
        notStrictEqual(replaceResponse[0], cacheResponse[0]);
        notDeepEqual(FIXTURES[0], cacheResponse[0]);
        start();
    });
});

test('cache clear', function() {
    expect(1);
    stop();

    run(function() {
        cache.set('modelname', FIXTURES);
        cache.clear();

        deepEqual(null, cache.get('modelname'));
        start();
    });
});