import Ember from 'ember';
import DS from 'ember-data';
import LFQueue from 'ember-localforage-adapter/utils/queue';
import LFCache from 'ember-localforage-adapter/utils/cache';

export default DS.Adapter.extend({
  defaultSerializer: 'localforage',
  queue: null,
  cache: LFCache.create(),
  caching: 'model',

  initRunner: Ember.on('init', function() {
    this.set('queue', LFQueue.create());
  }),

  /**
    This is the main entry point into finding records. The first parameter to
    this method is the model's name as a string.

    @method find
    @param {DS.Model} type
    @param {Object|String|Integer|null} id
    */
  find: function(store, type, id, snapshot) {
    var adapter = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter._namespaceForType(type).then(function(namespace) {

        var record = namespace.records[id];
        if (!record) {
          resolve(null);
        }

        resolve(record);
      });
    });
  },

  findMany: function(store, type, ids) {
    var adapter = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter._namespaceForType(type).then(function(namespace) {
        var results = [];

        for (var i = 0; i < ids.length; i++) {
          let recordToPush = namespace.records[ids[i]];
          if (recordToPush) {
            results.push(Ember.merge({}, recordToPush));
          }
        }

        resolve(results);
      });
    });
  },

  // Supports queries that look like this:
  //
  //   {
  //     <property to query>: <value or regex (for strings) to match>,
  //     ...
  //   }
  //
  // Every property added to the query is an "AND" query, not "OR"
  //
  // Example:
  //
  //  match records with "complete: true" and the name "foo" or "bar"
  //
  //    { complete: true, name: /foo|bar/ }
  findQuery: function(store, type, query, recordArray) {
    return this.query.apply(this, arguments);
  },
  query: function(store, type, query, recordArray) {
    var adapter = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter._namespaceForType(type).then(function(namespace) {
        var results = adapter._forageQuery(namespace.records, query);

        if (results.length) {
          results = adapter.loadRelationshipsForMany(store, type, results);
        }

        resolve(results);
      });
    });
  },

  _forageQuery: function(records, query) {
    var results = [],
      id, record, property, test, push;
    for (id in records) {
      record = records[id];
      for (property in query) {
        test = query[property];
        push = false;
        if (Object.prototype.toString.call(test) === '[object RegExp]') {
          push = test.test(record[property]);
        } else {
          push = record[property] === test;
        }
      }
      if (push) {
        results.push(record);
      }
    }
    return results;
  },

  findAll: function(store, type) {
    var adapter = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter._namespaceForType(type).then(function(namespace) {
        var results = [];

        for (var id in namespace.records) {
          results.push(Ember.merge({}, namespace.records[id]));
        }
        resolve(results);
      });
    });
  },

  createRecord: updateOrCreate,

  updateRecord: updateOrCreate,

  deleteRecord: function(store, type, snapshot) {
    var adapter = this;
    this.queue.attach(function(resolve, reject) {
      adapter._namespaceForType(type).then(function(namespaceRecords) {
        var id = snapshot.id;

        delete namespaceRecords.records[id];

        adapter.persistData(type, namespaceRecords).then(function() {
          resolve();
        }, function(err){
          reject(err);
        });
      });
    });

    return Ember.RSVP.resolve();
  },

  generateIdForRecord: function() {
    return Math.random().toString(32).slice(2).substr(0, 5);
  },

  // private

  adapterNamespace: function() {
    return this.get('namespace') || 'DS.LFAdapter';
  },

  loadData: function() {
    var adapter = this;
    let appAdapter = this.container.lookup('adapter:application');
    return new Ember.RSVP.Promise((resolve, reject) => {
      window.localforage.getItem(adapter.adapterNamespace()).then(function(storage) {
        var resolved = storage ? storage : {};
        resolve(resolved);
      }, function(err) {
        reject(err);
      });
    });
  },

  persistData: function(type, data) {
    var adapter = this;
    var modelNamespace = this.modelNamespace(type);

    return new Ember.RSVP.Promise((resolve, reject) => {
      if (adapter.caching !== 'none') {
        adapter.cache.set(modelNamespace, data);
      }
      adapter.loadData().then(localStorageData => {
        localStorageData[modelNamespace] = data;
        var toBePersisted = localStorageData;

        if (window.isPersisting) {
          return reject('localforage in progress');
        }

        window.isPersisting = true;
        window.localforage.setItem(adapter.adapterNamespace(), toBePersisted).then(() => {
          window.isPersisting = false;
          resolve();
        }, function(err) {
          reject(err);
        });
      }, function(err) {
        reject(err);
      });
    });


  },

  _namespaceForType: function(type) {
    var namespace = this.modelNamespace(type);
    var adapter = this;
    var cache;
    var promise;

    if (adapter.caching !== 'none') {
      cache = adapter.cache.get(namespace);
    } else {
      cache = null;
    }
    if (cache) {
      promise = new Ember.RSVP.resolve(cache);
    } else {
      let appAdapter = this.container.lookup('adapter:application');
      promise = new Ember.RSVP.Promise((resolve, reject) => {
        window.localforage.getItem(adapter.adapterNamespace()).then(function(storage) {
          var ns = storage ? storage[namespace] || {
            records: {}
          } : {
            records: {}
          };
          if (adapter.caching === 'model') {
            adapter.cache.set(namespace, ns);
          } else if (adapter.caching === 'all') {
            if (storage) {
              adapter.cache.replace(storage);
            }
          }
          resolve(ns);
        }, function(err) {
          reject(err);
        });
      });
    }
    return promise;
  },

  modelNamespace: function(type) {
    return type.url || type.modelName;
  },
});

function updateOrCreate(store, type, snapshot) {
  var adapter = this;
  this.queue.attach(function(resolve, reject) {
    adapter._namespaceForType(type).then(function(namespaceRecords) {
      // This is fix for ember-data-offline, but probably it is better solution in general too
      var serializer = store.adapterFor(type.modelName).serializer;
      var recordHash = serializer.serialize(snapshot, {
        includeId: true
      });
      // update(id comes from snapshot) or create(id comes from serialization)
      var id = snapshot.id || recordHash.id;

      namespaceRecords.records[id] = recordHash;
      adapter.persistData(type, namespaceRecords).then(function() {
        resolve();
      }, function(err) {
        reject(err);
      });
    });
  });
  return Ember.RSVP.resolve();
}
