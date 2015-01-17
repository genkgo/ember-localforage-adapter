import DS from 'ember-data';

export default DS.Transform.extend({
  serialize: function(day) {
    return day * 24;
  },
  deserialize: function(hour) {
    return hour / 24;
  }
});