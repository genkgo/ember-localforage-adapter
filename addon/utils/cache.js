import Ember from 'ember';

export default Ember.Object.extend ({
  
  data : [],
  
  clear : function () {
    this.data = [];
  },
  
  get : function (namespace) {
    if (this.data[namespace]) {
      return Ember.copy(this.data[namespace], true);
    } else {
      return null;
    }
  },
  
  set : function (namespace, objects) {
    this.data[namespace] = Ember.copy(objects, true);
  },
  
  replace : function (data) {
    this.data = data;
  }
  
});