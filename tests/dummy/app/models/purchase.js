import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  amount: DS.attr('number'),

  ledger: DS.belongsTo('ledger'),
  player: DS.belongsTo('player')
});