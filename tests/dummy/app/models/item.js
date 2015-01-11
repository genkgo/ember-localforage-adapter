import DS from 'ember-data';

var attr = DS.attr;
var belongsTo = DS.belongsTo;

export default DS.Model.extend({
  name: attr('string'),
  list: belongsTo('list')
});