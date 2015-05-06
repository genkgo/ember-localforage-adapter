import DS from 'ember-data';

export default DS.Model.extend({
  customerNumber: DS.Model(),
  hour: DS.belongsTo('hour'),
  addresses: DS.hasMany('address')
});
