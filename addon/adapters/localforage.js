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
      var allowRecursive = true;
      this._namespaceForType(type).then((namespace) => {
        /**
         * In the case where there are relationships, this method is called again
         * for each relation. Given the relations have references to the main
         * object, we use allowRecursive to avoid going further into infinite
         * recursiveness.
         *
         * Concept from ember-indexdb-adapter
         */
        if (snapshot && typeof snapshot.allowRecursive !== 'undefined') {
          allowRecursive = snapshot.allowRecursive;
        }

        var record = namespace.records[id];
        if (!record) {
          reject();
          return;
        }

        if (allowRecursive) {
          this.loadRelationships(store, type, record).then(function (finalRecord) {
            resolve(finalRecord);
          });
        } else {
          resolve(record);
        }
      });
    });
  },

  findMany: function (store, type, ids) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._namespaceForType(type).then(function (namespace) {
        var results = [];

        for (var i = 0; i < ids.length; i++) {
          results.push(Ember.copy(namespace.records[ids[i]]));
        }

        resolve(results);
      });
    }).then((records) => {
      if (records.get('length')) {
        return this.loadRelationshipsForMany(store, type, records);
      } else {
        return records;
      }
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
        var results = this._query(namespace.records, query);

        if (results.get('length')) {
          results = this.loadRelationshipsForMany(store, type, results);
        }

        resolve(results);
      });
    });

  },

  queryRecord: function (store, type, query) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._namespaceForType(type).then((namespace) => {
        var result = this._query(namespace.records, query, true);

        if (result) {
          result = this.loadRelationships(store, type, result);
          resolve(result);
        } else {
          reject();
        }
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

  findAll: function (store, type) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this._namespaceForType(type).then(function (namespace) {
        var results = [];

        for (var id in namespace.records) {
          results.push(Ember.copy(namespace.records[id]));
        }
        resolve(results);
      });
    });
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


  /**
   * This takes a record, then analyzes the model relationships and replaces
   * ids with the actual values.
   *
   * Stolen from ember-indexdb-adapter
   *
   * Consider the following JSON is entered:
   *
   * ```js
   * {
   *   "id": 1,
   *   "title": "Rails Rambo",
   *   "comments": [1, 2]
   * }
   *
   * This will return:
   *
   * ```js
   * {
   *   "id": 1,
   *   "title": "Rails Rambo",
   *   "comments": [1, 2]
   *
   *   "_embedded": {
   *     "comment": [{
   *       "_id": 1,
   *       "comment_title": "FIRST"
   *     }, {
   *       "_id": 2,
   *       "comment_title": "Rails is unagi"
   *     }]
   *   }
   * }
   *
   * This way, whenever a resource returned, its relationships will be also
   * returned.
   *
   * @method loadRelationships
   * @private
   * @param {DS.Store} store
   * @param {DS.Model} type
   * @param {Object} record
   */
  loadRelationships: function (store, type, record) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      var resultJSON = {},
        modelName = type.modelName,
        relationshipNames, relationships,
        relationshipPromises = [];

      relationshipNames = Ember.get(type, 'relationshipNames');
      relationships = relationshipNames.belongsTo;
      relationships = relationships.concat(relationshipNames.hasMany);

      relationships.forEach((relationName) => {
        var relationModel = type.typeForRelationship(relationName, store),
          relationEmbeddedId = record[relationName],
          relationProp = this.relationshipProperties(type, relationName),
          relationType = relationProp.kind,
          promise, embedPromise;

        var opts = {allowRecursive: false};

        /**
         * embeddedIds are ids of relations that are included in the main
         * payload, such as:
         *
         * {
         *    cart: {
         *      id: "s85fb",
         *      customer: "rld9u"
         *    }
         * }
         *
         * In this case, cart belongsTo customer and its id is present in the
         * main payload. We find each of these records and add them to _embedded.
         */
        var embeddedAlways = this.isEmbeddedAlways(store, type.modelName, relationProp.key);
        var relationAdapter = store.adapterFor(relationModel.modelName);

        // For embeddedAlways-style data, we assume the data to be present already, so no further loading is needed.
        if (relationEmbeddedId && !embeddedAlways) {
          if (relationType === 'belongsTo' || relationType === 'hasOne') {
            promise = relationAdapter.findRecord(store, relationModel, relationEmbeddedId, opts);
          } else if (relationType === 'hasMany') {
            promise = relationAdapter.findMany(store, relationModel, relationEmbeddedId, opts);
          }

          embedPromise = new Ember.RSVP.Promise((resolve, reject) => {
            promise.then((relationRecord) => {
              resolve(this.addEmbeddedPayload(record, relationName, relationRecord));
            });
          });

          relationshipPromises.push(embedPromise);
        }
      });

      Ember.RSVP.all(relationshipPromises).then(function () {
        resolve(record);
      });
    });
  },


  /**
   * Given the following payload,
   *
   *   {
   *      cart: {
   *        id: "1",
   *        customer: "2"
   *      }
   *   }
   *
   * With `relationshipName` being `customer` and `relationshipRecord`
   *
   *   {id: "2", name: "Rambo"}
   *
   * This method returns the following payload:
   *
   *   {
   *      cart: {
   *        id: "1",
   *        customer: "2"
   *      },
   *      _embedded: {
   *        customer: {
   *          id: "2",
   *          name: "Rambo"
   *        }
   *      }
   *   }
   *
   * which is then treated by the serializer later.
   *
   * @method addEmbeddedPayload
   * @private
   * @param {Object} payload
   * @param {String} relationshipName
   * @param {Object} relationshipRecord
   */
  addEmbeddedPayload: function (payload, relationshipName, relationshipRecord) {
    var objectHasId = (relationshipRecord && relationshipRecord.id),
      arrayHasIds = (relationshipRecord.length && relationshipRecord.isEvery("id")),
      isValidRelationship = (objectHasId || arrayHasIds);

    if (isValidRelationship) {
      if (!payload._embedded) {
        payload._embedded = {};
      }

      payload._embedded[relationshipName] = relationshipRecord;
      if (relationshipRecord.length) {
        payload[relationshipName] = relationshipRecord.mapBy('id');
      } else {
        payload[relationshipName] = relationshipRecord.id;
      }
    }

    if (this.isArray(payload[relationshipName])) {
      payload[relationshipName] = payload[relationshipName].filter(function (id) {
        return id;
      });
    }

    return payload;
  },


  isArray: function (value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  },

  /**
   * Same as `loadRelationships`, but for an array of records.
   *
   * @method loadRelationshipsForMany
   * @private
   * @param {DS.Store} store
   * @param {DS.Model} type
   * @param {Object} recordsArray
   */
  loadRelationshipsForMany: function (store, type, recordsArray) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      var recordsWithRelationships = [],
        recordsToBeLoaded = [],
        promises = [];

      /**
       * Some times Ember puts some stuff in arrays. We want to clean it so
       * we know exactly what to iterate over.
       */
      for (var i in recordsArray) {
        if (recordsArray.hasOwnProperty(i)) {
          recordsToBeLoaded.push(recordsArray[i]);
        }
      }

      var loadNextRecord = (record) => {
        /**
         * Removes the first item from recordsToBeLoaded
         */
        recordsToBeLoaded = recordsToBeLoaded.slice(1);

        var promise = this.loadRelationships(store, type, record);

        promise.then(function (recordWithRelationships) {
          recordsWithRelationships.push(recordWithRelationships);

          if (recordsToBeLoaded[0]) {
            loadNextRecord(recordsToBeLoaded[0]);
          } else {
            resolve(recordsWithRelationships);
          }
        });
      };

      /**
       * We start by the first record
       */
      loadNextRecord(recordsToBeLoaded[0]);
    });
  },


  /**
   *
   * @method relationshipProperties
   * @private
   * @param {DS.Model} type
   * @param {String} relationName
   */
  relationshipProperties: function (type, relationName) {
    var relationships = Ember.get(type, 'relationshipsByName');
    if (relationName) {
      return relationships.get(relationName);
    } else {
      return relationships;
    }
  },

  isEmbeddedAlways: function (store, modelName, relationKey) {
    if (store === undefined || store === null) {
      return false;
    }

    var serializer = store.serializerFor(modelName);
    return typeof(serializer.hasEmbeddedAlwaysOption) === 'function' &&
      serializer.hasEmbeddedAlwaysOption(relationKey);
  }
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
