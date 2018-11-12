import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupTest } from 'ember-qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import FIXTURES from '../helpers/fixtures/display-deep-model';
import localforage from 'localforage';

var App;

module('Display deep model', function(hooks) {
  hooks.beforeEach(function (assert) {
    var done = assert.async();
    run(function () {
      localforage.setItem('DS.LFAdapter', FIXTURES).then(function () {
        done();
      });
    });

    run(function () {
      App = startApp();
    });
  });

  hooks.afterEach(function () {
    run(function () {
      destroyApp(App);
    });
  });

  setupTest(hooks);

  test('find customer -> hour -> order', async function (assert) {
    assert.expect(4);

    let done = assert.async();
    let adapter = this.owner.lookup('adapter:application');
    adapter.get('cache').clear();

    await visit('/purchase/1');
    run.later(function() {
      assert.dom('div.name').hasText('credits');
      assert.dom('div.amount').hasText('10');
      assert.dom('div.player').hasText('one');
      assert.dom('div.ledger').hasText('payable');
      done();
    }, 300);
  });
});
