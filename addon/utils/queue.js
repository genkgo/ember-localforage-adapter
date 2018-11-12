import { resolve, Promise as EmberPromise } from 'rsvp';
import EmberObject from '@ember/object';

export default EmberObject.extend({

  init: function () {
    this.queue = [resolve()];
  },

  attach(callback) {
    const queueKey = this.queue.length;

    this.queue[queueKey] = new EmberPromise((resolve, reject) => {
      this.queue[queueKey - 1].then(() => {
        this.queue.splice(queueKey - 1, 1);
        callback(resolve, reject);
      });
    });

    return this.queue[queueKey];
  }
});
