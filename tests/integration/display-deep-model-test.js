import Ember from 'ember';
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';
import FIXTURES from '../helpers/fixtures/display-deep-model';

var App;
var store;
var adapter;
var server;
var run = Ember.run;
var get = Ember.get;
var set = Ember.set;

module('Display deep model', {
  setup: function() {
    run( function() {
      window.localforage.setItem('DS.LFAdapter', FIXTURES);
    });

    run( function() {
      App = startApp();
      store = App.__container__.lookup('store:main');
      adapter = App.__container__.lookup('adapter:application');
      adapter.get('cache').clear();
    });
  },

  teardown: function() {
    run(App, 'destroy');
  }
});

test('find customer -> hour -> order', function() {
  expect(4);

  visit('/purchase/1');
  andThen(function() {
    equal(find('div.name').text(), 'credits');
    equal(find('div.amount').text(), '10');
    equal(find('div.player').text(), 'one');
    equal(find('div.ledger').text(), 'payable');
  });
});