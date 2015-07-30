import Ember from 'ember';

export default Ember.Object.extend({
  counter: 0,
  attach: function(callback) {
    new Ember.RSVP.Promise((resolve, reject) => {
      callback(resolve, reject);
    }).then(() => {
      this.counter = this.counter + 1;
    }, (err) => {
      Ember.run.later(() => {
        this.attach(callback);
      }, 200);
    });
  }
});
