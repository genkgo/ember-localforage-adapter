import Ember from 'ember';

export default Ember.Object.extend ({
  
  data : Ember.Map.create(),
  
  clear : function () {
    this.data.clear();
  },
  
  get : function (namespace) {
    if (this.data.get(namespace)) {
      return Ember.copy(Ember.A(this.data.get(namespace)), true);
    } else {
      return null;
    }
  },
  
  set : function (namespace, objects) {
    this.data.set(namespace, Ember.copy(Ember.A(objects), true));
  },
  
  replace : function (data) {
    this.clear();
    for (var index in data) {
      this.set(index, data[index]);
    }
  }
  
});