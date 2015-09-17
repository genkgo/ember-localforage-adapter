import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONSerializer.extend({

  _shouldSerializeHasMany: function (snapshot, key, relationship) {
    var relationshipType = snapshot.type.determineRelationshipType(relationship, this.store);
    if (this._mustSerialize(key)) {
      return true;
    }
    return this._canSerialize(key) &&
      (relationshipType === 'manyToNone' ||
        relationshipType === 'manyToMany' ||
        relationshipType === 'manyToOne');
  },  

  // Omit the unknown hasMany relationships of pushed record
  // (see https://github.com/emberjs/data/issues/3760)
  // TODO: this override will be unecessary after merge of the following PR:
  // https://github.com/emberjs/data/pull/3765
  serializeHasMany: function(snapshot, json, relationship) {
    var key = relationship.key;

    if (this._shouldSerializeHasMany(snapshot, key, relationship)) {
      var hasMany = snapshot.hasMany(key, { ids: true });
      if (hasMany !== undefined) {
        // if provided, use the mapping provided by `attrs` in
        // the serializer
        var payloadKey = this._getMappedKey(key);
        if (payloadKey === key && this.keyForRelationship) {
          payloadKey = this.keyForRelationship(key, "hasMany", "serialize");
        }

        json[payloadKey] = hasMany;
        // TODO support for polymorphic manyToNone and manyToMany relationships
      }
    }
  },

  // Remove the undefined hasMany relationships which will fail at normalization
  // (see https://github.com/emberjs/data/issues/3736)
  // TODO: this override will be unecessary after merge of the following PR:
  // https://github.com/emberjs/data/pull/3747
  extractRelationships: function(modelClass, resourceHash) {
    let relationships = {};

    modelClass.eachRelationship((key, relationshipMeta) => {
      let relationship = null;
      let relationshipKey = this.keyForRelationship(key, relationshipMeta.kind, 'deserialize');
      if (resourceHash.hasOwnProperty(relationshipKey)) {
        let data = null;
        let relationshipHash = resourceHash[relationshipKey];
        if (relationshipMeta.kind === 'belongsTo') {
          data = this.extractRelationship(relationshipMeta.type, relationshipHash);
        } else if (relationshipMeta.kind === 'hasMany') {
          data = Ember.isNone(relationshipHash) ? null : relationshipHash.map((item) => this.extractRelationship(relationshipMeta.type, item));
        }
        relationship = { data };
      }

      let linkKey = this.keyForLink(key, relationshipMeta.kind);
      if (resourceHash.links && resourceHash.links.hasOwnProperty(linkKey)) {
        let related = resourceHash.links[linkKey];
        relationship = relationship || {};
        relationship.links = { related };
      }

      if (relationship) {
        relationships[key] = relationship;
      }
    });

    return relationships;
  }
});
