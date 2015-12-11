import Ember from 'ember';
import DS from 'ember-data';
import LFQueue from 'ember-localforage-adapter/utils/queue';
import LFCache from 'ember-localforage-adapter/utils/cache';

export default DS.Adapter.extend(Ember.Evented, {

  defaultSerializer: 'localforage',
  queue: LFQueue.create(),
  cache: LFCache.create(),
  caching: 'model',
  coalesceFindRequests: true,

  shouldBackgroundReloadRecord() {
    return false;
  },

  shouldReloadAll() {
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
   */
  findRecord(store, type, id) {
    return this._namespaceForType(type).then((namespace) => {
      const record = namespace.records[id];
      
      if (!record) {
        return Ember.RSVP.reject();
      }

      return record;
    });
  },

  findAll(store, type) {
    return this._namespaceForType(type).then((namespace) => {
      const records = [];

      for (let id in namespace.records) {
        records.push(namespace.records[id]);
      }

      return records;
    });
  },

  findMany(store, type, ids) {
    return this._namespaceForType(type).then((namespace) => {
      const records = [];

      for (let i = 0; i < ids.length; i++) {
        const record = namespace.records[ids[i]];

        if (record) {
          records.push(record);
        }
      }

      return records;
    });
  },

  queryRecord(store, type, query) {
    return this._namespaceForType(type).then((namespace) => {
      const record = this._query(namespace.records, query, true);

      if (!record) {
        return Ember.RSVP.reject();
      }

      return record;
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
  query(store, type, query) {
    return this._namespaceForType(type).then((namespace) => {
      return this._query(namespace.records, query);
    });
  },

  _query(records, query, singleMatch) {
    const results = [];

    for (let id in records) {
      const record = records[id];
      let push = false;

      for (let property in query) {
        const test = query[property];

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

  deleteRecord(store, type, snapshot) {
    return this.queue.attach((resolve) => {
      this._namespaceForType(type).then((namespaceRecords) => {
        delete namespaceRecords.records[snapshot.id];

        this.persistData(type, namespaceRecords).then(() => {
          resolve();
        });
      });
    });
  },

  generateIdForRecord() {
    return Math.random().toString(32).slice(2).substr(0, 5);
  },

  // private

  adapterNamespace() {
    return this.get('namespace') || 'DS.LFAdapter';
  },

  loadData() {
    return window.localforage.getItem(this.adapterNamespace()).then((storage) => {
      return storage ? storage : {};
    });
  },

  persistData(type, data) {
    const modelNamespace = this.modelNamespace(type);
    return this.loadData().then((localStorageData) => {
      if (this.caching !== 'none') {
        this.cache.set(modelNamespace, data);
      }

      localStorageData[modelNamespace] = data;

      return window.localforage.setItem(this.adapterNamespace(), localStorageData);
    });
  },

  _namespaceForType(type) {
    const namespace = this.modelNamespace(type);

    if (this.caching !== 'none') {
      const cache = this.cache.get(namespace);

      if (cache) {
        return Ember.RSVP.resolve(cache);
      }
    }

    return window.localforage.getItem(this.adapterNamespace()).then((storage) => {
      const ns = storage && storage[namespace] || { records: {} };

      if (this.caching === 'model') {
        this.cache.set(namespace, ns);
      } else if (this.caching === 'all') {
        if (storage) {
          this.cache.replace(storage);
        }
      }

      return ns;
    });
  },

  modelNamespace(type) {
    return type.url || type.modelName;
  }
});

function updateOrCreate(store, type, snapshot) {
  return this.queue.attach((resolve) => {
    this._namespaceForType(type).then((namespaceRecords) => {
      const serializer = store.serializerFor(type.modelName);
      const recordHash = serializer.serialize(snapshot, {includeId: true});
      // update(id comes from snapshot) or create(id comes from serialization)
      const id = snapshot.id || recordHash.id;

      namespaceRecords.records[id] = recordHash;

      this.persistData(type, namespaceRecords).then(() => {
        resolve();
      });
    });
  });
}
