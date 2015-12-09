import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import FIXTURES from '../helpers/fixtures/crud';
import MOCK_FIXTURES from '../helpers/fixtures/mock';

var App;
var store;
var adapter;
var run = Ember.run;
var get = Ember.get;

module("Cache integration", {
  beforeEach: function(assert) {
    let done = assert.async();
    run(function() {
      window.localforage.setItem('DS.LFAdapter', FIXTURES).then(function() {
        window.localforage.setItem('MockAdapter', MOCK_FIXTURES).then(function() {
          done();
        });
      });
    });

    run(function() {
      App = startApp();
      store = App.__container__.lookup('service:store');
      adapter = App.__container__.lookup('adapter:application');
      adapter.get('cache').clear();
    });
  },

  afterEach: function() {
    destroyApp(App);
  }
});

test("cache should be unbound data", function(assert) {
  assert.expect(13);

  let done = assert.async();
  run(function() {
    store.findAll('list').then(function(records) {
      var listCache;
      var firstRecord = records.objectAt(0);
      var secondRecord = records.objectAt(1);
      var thirdRecord = records.objectAt(2);

      assert.equal(get(records, 'length'), 3, "3 items were found");

      assert.equal(get(firstRecord, 'name'), "one", "First item's name is one");
      assert.equal(get(secondRecord, 'name'), "two", "Second item's name is two");
      assert.equal(get(thirdRecord, 'name'), "three", "Third item's name is three");

      assert.equal(get(firstRecord, 'day'), 1, "First item's day is 1");
      assert.equal(get(secondRecord, 'day'), 2, "Second item's day is 2");
      assert.equal(get(thirdRecord, 'day'), 3, "Third item's day is 3");

      listCache = adapter.get('cache').get('list').records;
      assert.equal(listCache[get(firstRecord, 'id')].name, 'one');
      assert.equal(listCache[get(firstRecord, 'id')].addObserver, null);

      firstRecord.set('name', 'two');
      listCache = adapter.get('cache').get('list').records;
      assert.equal(listCache[get(firstRecord, 'id')].name, 'one');
      assert.equal(listCache[get(firstRecord, 'id')].addObserver, null);

      firstRecord.save().then(function () {
        listCache = adapter.get('cache').get('list').records;
        assert.equal(listCache[get(firstRecord, 'id')].name, 'two');
        assert.equal(listCache[get(firstRecord, 'id')].addObserver, null);
        done();
      });
    });
  });
});