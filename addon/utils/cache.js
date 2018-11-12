import EmberObject from '@ember/object';

export default EmberObject.extend({

  init: function () {
    this.data = new Map();
  },

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

    for (let index of Object.keys(data)) {
      this.set(index, data[index]);
    }
  }
});
