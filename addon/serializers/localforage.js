import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONSerializer.extend({

  isNewSerializerAPI: true,

  serializeHasMany: function (snapshot, json, relationship) {
    var key = relationship.key;

    if (this._canSerialize(key)) {
      var payloadKey;

      // if provided, use the mapping provided by `attrs` in
      // the serializer
      payloadKey = this._getMappedKey(key);
      if (payloadKey === key && this.keyForRelationship) {
        payloadKey = this.keyForRelationship(key, "hasMany", "serialize");
      }

      var relationshipType = snapshot.type.determineRelationshipType(relationship, this.store);

      if (relationshipType === 'manyToNone' ||
        relationshipType === 'manyToMany' ||
        relationshipType === 'manyToOne') {
        json[payloadKey] = snapshot.hasMany(key, {ids: true});
        // TODO support for polymorphic manyToNone and manyToMany relationships
      }
    }
  },

  /**
   * Normalize whatever was returned from the adapter.
   *
   * If the adapter returns relationships in an embedded way, such as follows:
   *
   * ```js
   * {
   *   "id": 1,
   *   "title": "Rails Rambo",
   *
   *   "_embedded": {
   *     "comment": [{
   *       "id": 1,
   *       "comment_title": "FIRST"
   *     }, {
   *       "id": 2,
   *       "comment_title": "Rails is unagi"
   *     }]
   *   }
   * }
   *
   * this method will create separated JSON for each resource and then push
   * them individually to the Store.
   *
   * In the end, only the main resource will remain, containing the ids of its
   * relationships. Given the relations are already in the Store, we will
   * return a JSON with the main resource alone. The Store will sort out the
   * associations by itself.
   *
   * @method normalize
   * @param {DS.Model} primaryModelClass the type/model
   * @param {Object} payload returned JSON
   */
  normalize: function (primaryModelClass, payload) {
    var normalizedPayload = this._normalizeEmbeddedPayload(primaryModelClass, payload);
    return this._super(primaryModelClass, normalizedPayload);
  },

  _normalizeEmbeddedPayload: function (primaryModelClass, payload) {
    if (payload && payload._embedded) {
      for (var relation in payload._embedded) {
        var relModelClass = primaryModelClass.typeForRelationship(relation, this.store);
        var typeName = relModelClass.modelName,
          embeddedPayload = payload._embedded[relation];

        if (embeddedPayload) {
          var relSerializer = this.store.serializerFor(typeName);
          if (Ember.isArray(embeddedPayload)) {
            for (var i = 0; i < embeddedPayload.length; i++) {
              this.store.push(relSerializer.normalize(relModelClass, embeddedPayload[i]));
            }
          } else {
            this.store.push(relSerializer.normalize(relModelClass, embeddedPayload));
          }
        }
      }

      delete payload._embedded;
    }

    // Remove the undefined hasMany relationships which will fail at normalization
    // (see https://github.com/emberjs/data/issues/3736)
    var relationshipNames = Ember.get(primaryModelClass, 'relationshipNames');
    var relationships     = relationshipNames.hasMany;

    relationships.forEach((relationName) => {
      if (Ember.isNone(payload[relationName])) {
        delete payload[relationName];
      }
    });

    return payload;
  },
});
