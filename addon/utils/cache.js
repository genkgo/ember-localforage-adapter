import Ember from 'ember';

export default Ember.Object.extend({

  data: Ember.Map.create(),

  clear: function () {
    this.data.clear();
  },

  get: function (namespace) {
    if (this.data.get(namespace)) {
      return this.data.get(namespace);
    } else {
      return null;
    }
  },

  set: function (namespace, objects) {
    this.data.set(namespace, objects);
  },

  replace: function (data) {
    this.clear();
    for (var index in data) {
      this.set(index, data[index]);
    }
  }

});