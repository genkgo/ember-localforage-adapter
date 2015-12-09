import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import FIXTURES from '../helpers/fixtures/display-deep-model';

var App;
var store;
var adapter;
var run = Ember.run;

module('Display deep model', {
  beforeEach: function (assert) {
    var done = assert.async();
    run(function () {
      window.localforage.setItem('DS.LFAdapter', FIXTURES).then(function () {
        done();
      });
    });

    run(function () {
      App = startApp();
      store = App.__container__.lookup('service:store');
      adapter = App.__container__.lookup('adapter:application');
      adapter.get('cache').clear();
    });
  },

  afterEach: function () {
    run(function () {
      destroyApp(App);
    });
  }
});

test('find customer -> hour -> order', function (assert) {
  assert.expect(4);

  visit('/purchase/1');
  andThen(function () {
    var done = assert.async();
    run.later(function() {
      assert.equal(find('div.name').text(), 'credits');
      assert.equal(find('div.amount').text(), '10');
      assert.equal(find('div.player').text(), 'one');
      assert.equal(find('div.ledger').text(), 'payable');
      done();
    }, 300);
  });
});