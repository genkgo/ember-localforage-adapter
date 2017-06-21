import DS from 'ember-data';

export default DS.Model.extend({
  customerNumber: DS.attr(),
  hour: DS.belongsTo('hour', { async: false }),
  addresses: DS.hasMany('address', { async: false })
});
