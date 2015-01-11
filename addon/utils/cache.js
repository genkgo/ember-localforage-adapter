import Ember from 'ember';

export default Ember.Object.extend ({
  
  data : [],
  
  clear : function () {
    this.data = [];
  },
  
  get : function (namespace) {
    if (this.data[namespace]) {
      return this.data[namespace];
    } else {
      return null;
    }
  },
  
  set : function (namespace, objects) {
    this.data[namespace] = objects;
  },
  
  replace : function (data) {
    this.data = data;
  }
  
});