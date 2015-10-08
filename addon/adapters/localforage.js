import Ember from 'ember';
import DS from 'ember-data';
import LFQueue from 'ember-localforage-adapter/utils/queue';
import LFCache from 'ember-localforage-adapter/utils/cache';

export default DS.Adapter.extend(Ember.Evented, {
  defaultSerializer: 'localforage',
  queue: LFQueue.create(),
  cache: LFCache.create(),
  caching: 'model',

  shouldBackgroundReloadRecord: function (store, snapshot) {
    return false;
  },

  shouldReloadAll: function (store, snapshotRecordArray) {
    return true;
  },

  /**
   * This is the main entry point into finding records. The first parameter to
   * this method is the model's name as a string.
   *
   * @method findRecord
   * @param store
   * @param {DS.Model} type
   * @param {Object|String|Integer|null} id
   * @param snapshot
   */
  findRecord: function (store, type, id, snapshot) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._namespaceForType(type).then((namespace) => {
        var record = namespace.records[id];
        if (record) {
          resolve(record);
        } else {
          reject();
        }
      });
    });
  },

  findAll: function (store, type) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._namespaceForType(type).then(function (namespace) {
        var records = [];

        for (var id in namespace.records) {
          records.push(Ember.copy(namespace.records[id]));
        }

        resolve(records);
      });
    });
  },

  coalesceFindRequests: true,

  findMany: function (store, type, ids) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._namespaceForType(type).then(function (namespace) {
        var records = [];
        var record;

        for (var i = 0; i < ids.length; i++) {
          record = namespace.records[ids[i]];
          if (record) {
            records.push(Ember.copy(record));
          }
        }

        resolve(records);
      });
    });
  },

  queryRecord: function (store, type, query) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._namespaceForType(type).then((namespace) => {
        var record = this._query(namespace.records, query, true);
        if (record) {
          resolve(record);
        } else {
          reject();
        }
      });
    });

  },

  /**
   *  Supports queries that look like this:
   *   {
   *     <property to query>: <value or regex (for strings) to match>,
   *     ...
   *   }
   *
   * Every property added to the query is an "AND" query, not "OR"
   *
   * Example:
   * match records with "complete: true" and the name "foo" or "bar"
   *  { complete: true, name: /foo|bar/ }
   */
  query: function (store, type, query) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._namespaceForType(type).then((namespace) => {
        var records = this._query(namespace.records, query);
        resolve(records);
      });
    });

  },

  _query: function (records, query, singleMatch) {
    var results = [];

    for (var id in records) {
      var record = records[id],
        push = false;

      for (var property in query) {
        var test = query[property];
        if (Object.prototype.toString.call(test) === '[object RegExp]') {
          push = test.test(record[property]);
        } else {
          push = record[property] === test;
        }
        if (push === false) {
          break; // all criteria should pass
        }
      }

      if (push) {
        results.push(record);
      }

      if (singleMatch) {
        return results[0];
      }
    }

    return results;
  },

  createRecord: updateOrCreate,

  updateRecord: updateOrCreate,

  deleteRecord: function (store, type, snapshot) {
    return this.queue.attach((resolve, reject) => {
      this._namespaceForType(type).then((namespaceRecords) => {
        var id = snapshot.id;

        delete namespaceRecords.records[id];

        this.persistData(type, namespaceRecords).then(function () {
          resolve();
        });
      });
    });
  },

  generateIdForRecord: function () {
    return Math.random().toString(32).slice(2).substr(0, 5);
  },

  // private

  adapterNamespace: function () {
    return this.get('namespace') || 'DS.LFAdapter';
  },

  loadData: function () {
    return new Ember.RSVP.Promise((resolve, reject) => {
      window.localforage.getItem(this.adapterNamespace()).then(function (storage) {
        var resolved = storage ? storage : {};
        resolve(resolved);
      });
    });
  },

  persistData: function (type, data) {
    var modelNamespace = this.modelNamespace(type);
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (this.caching !== 'none') {
        this.cache.set(modelNamespace, data);
      }
      this.loadData().then((localStorageData) => {
        localStorageData[modelNamespace] = data;
        window.localforage.setItem(this.adapterNamespace(), localStorageData).then(function () {
          resolve();
        });
      });
    });
  },

  _namespaceForType: function (type) {
    var namespace = this.modelNamespace(type);
    var cache, promise;

    if (this.caching !== 'none') {
      cache = this.cache.get(namespace);
    } else {
      cache = null;
    }
    if (cache) {
      promise = Ember.RSVP.resolve(cache);
    } else {
      promise = new Ember.RSVP.Promise((resolve, reject) => {
        window.localforage.getItem(this.adapterNamespace()).then((storage) => {
          var ns = storage ? storage[namespace] || {records: {}} : {records: {}};
          if (this.caching === 'model') {
            this.cache.set(namespace, ns);
          } else if (this.caching === 'all') {
            if (storage) {
              this.cache.replace(storage);
            }
          }
          resolve(ns);
        });
      });
    }
    return promise;
  },

  modelNamespace: function (type) {
    return type.url || type.modelName;
  },
});

function updateOrCreate(store, type, snapshot) {
  return this.queue.attach((resolve, reject) => {
    this._namespaceForType(type).then((namespaceRecords) => {
      var serializer = store.serializerFor(type.modelName);
      var recordHash = serializer.serialize(snapshot, {includeId: true});
      // update(id comes from snapshot) or create(id comes from serialization)
      var id = snapshot.id || recordHash.id;

      namespaceRecords.records[id] = recordHash;
      this.persistData(type, namespaceRecords).then(function () {
        resolve();
      });
    });
  });
}
