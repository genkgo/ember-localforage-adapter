import DS from 'ember-data';

export default DS.Model.extend({
  customerNumber: DS.Model(),
  parentCustomer: DS.belongsTo('customer'),
  addresses: DS.hasMany('address')
});
