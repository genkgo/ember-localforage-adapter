import DS from 'ember-data';

var Serializer = DS.JSONSerializer.extend({

  shouldSerializeHasMany(snapshot, key, relationship) {
    const relationshipType = snapshot.type.determineRelationshipType(relationship, this.store);

    if (this._mustSerialize(key)) {
      return true;
    }

    return this._canSerialize(key) &&
      (relationshipType === 'manyToNone' ||
        relationshipType === 'manyToMany' ||
        relationshipType === 'manyToOne');
  }
});

// Make Serializer compatible with older versions of ember-data.
// From ember-data 2.12.0 on there is a deprecation for
// this._shouldSerializeHasMany. The private API has been prompted
// to public API this.shouldSerializeHasMany. The private API will be
// removed in ember-data 3.0.0.
// See https://www.emberjs.com/deprecations/ember-data/v2.x/#toc_jsonserializer-shouldserializehasmany
if( ! DS.JSONSerializer.prototype.shouldSerializeHasMany ) {
  Serializer.reopen({
    _shouldSerializeHasMany( snapshot, key, relationship ){
      return this.shouldSerializeHasMany( snapshot, key, relationship );
    }
  });
}

export default Serializer;
