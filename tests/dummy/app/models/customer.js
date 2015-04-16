import DS from 'ember-data';

var attr = DS.attr;
var hasMany = DS.hasMany;

export default DS.Model.extend({
  customerNumber: DS.Model(),
  addresses: hasMany('address')
});
