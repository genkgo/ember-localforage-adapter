import DS from 'ember-data';

var attr = DS.attr;
var belongsTo = DS.belongsTo;

export default DS.Model.extend({
  name: attr('string'),
  order: belongsTo('order'),
  amount: attr('number')
});