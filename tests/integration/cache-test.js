import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import FIXTURES from '../helpers/fixtures/crud';
import MOCK_FIXTURES from '../helpers/fixtures/mock';
import localforage from 'localforage';

var App;
var proto = Object.prototype;
var gpo = Object.getPrototypeOf;

module("Cache integration", function(hooks) {
  hooks.beforeEach(function(assert) {
    let done = assert.async();
    run(function() {
      localforage.setItem('DS.LFAdapter', FIXTURES).then(function() {
        localforage.setItem('MockAdapter', MOCK_FIXTURES).then(function() {
          done();
        });
      });
    });

    run(function() {
      App = startApp();
    });
  });

  hooks.afterEach(function() {
    destroyApp(App);
  });

  setupTest(hooks);

  /**
   * @credits https://github.com/nickb1080/is-pojo
   * @param obj
   * @returns {boolean}
   */
  function isPojo(obj) {
    if (obj === null || typeof obj !== "object") {
      return false;
    }
    return gpo(obj) === proto;
  }

  test("cache should be unbound data", function(assert) {
    assert.expect(13);

    let done = assert.async();
    let adapter = this.owner.lookup('adapter:application');
    let store = this.owner.lookup('service:store');

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

        listCache = adapter.get('cache').get('list');
        assert.equal(isPojo(listCache), true);
        assert.equal(listCache.records[get(firstRecord, 'id')].name, 'one');

        firstRecord.set('name', 'two');
        listCache = adapter.get('cache').get('list');
        assert.equal(isPojo(listCache), true);
        assert.equal(listCache.records[get(firstRecord, 'id')].name, 'one');

        firstRecord.save().then(function () {
          listCache = adapter.get('cache').get('list');
          assert.equal(isPojo(listCache), true);
          assert.equal(listCache.records[get(firstRecord, 'id')].name, 'two');
          done();
        });
      });
    });
  });
});
