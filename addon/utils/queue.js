import Ember from 'ember';

export default Ember.Object.extend ({

  queue : [new Ember.RSVP.resolve()],

  attach : function (callback) {
    var self = this;
    var queueKey = self.queue.length;

    self.queue[queueKey] = new Ember.RSVP.Promise(function(resolve, reject) {
      self.queue[queueKey - 1].then (function () {
        callback(resolve, reject);
      });
    });

    return self.queue[queueKey];
  },


});