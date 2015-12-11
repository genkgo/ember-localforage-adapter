import Ember from 'ember';

export default Ember.Object.extend({

  data: Ember.Map.create(),

  clear() {
    this.data.clear();
  },

  get(namespace) {
    const data = this.data.get(namespace);

    if (!data) {
      return null;
    }

    return data;
  },

  set(namespace, objects) {
    this.data.set(namespace, objects);
  },

  replace(data) {
    this.clear();
    
    for (let index in data) {
      this.set(index, data[index]);
    }
  }
});