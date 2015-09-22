import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  balance: DS.attr('number'),

  ledger: DS.belongsTo('ledger'),
  purchases: DS.hasMany('purchase')
});