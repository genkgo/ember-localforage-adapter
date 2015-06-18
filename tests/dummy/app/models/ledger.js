import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),

  purchases: DS.hasMany('purchase', {async: true}),
  players: DS.hasMany('player', {async: true})
});