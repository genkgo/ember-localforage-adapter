import Ember from 'ember';
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';

var App;
var store;
var adapter;
var server;
var run = Ember.run;
var get = Ember.get;
var set = Ember.set;

var FIXTURES = {
  'list': {
    records: {
      'l1': { id: 'l1', name: 'one', b: true, items: ['i1', 'i2'], day: 24 },
      'l2': { id: 'l2', name: 'two', b: false, items: [], day: 48 },
      'l3': { id: 'l3', name: 'three', b: false, items: [], day: 72 }
    }
  },

  'item': {
    records: {
      'i1': { id: 'i1', name: 'one', list: 'l1' },
      'i2': { id: 'i2', name: 'two', list: 'l1' }
    }
  },

  'order': {
    records: {
      'o1': { id: 'o1', name: 'one', b: true, hours: ['h1', 'h2'] },
      'o2': { id: 'o2', name: 'two', b: false, hours: [] },
      'o3': { id: 'o3', name: 'three', b: true, hours: ['h3', 'h4'] },
      'o4': { id: 'o4', name: 'four', b: true, hours: [] }
    }
  },

  'hour': {
    records: {
      'h1': { id: 'h1', name: 'one', amount: 4, order: 'o1' },
      'h2': { id: 'h2', name: 'two', amount: 3, order: 'o1' },
      'h3': { id: 'h3', name: 'three', amount: 2, order: 'o3' },
      'h4': { id: 'h4', name: 'four', amount: 1, order: 'o3' }
    }
  }
};

module('CRUD', {
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


test('find with id', function() {
  expect(4);

  stop();
  run(function() {
    store.find('list', 'l1').then(function(list) {
      equal(get(list, 'id'),   'l1',  'id is loaded correctly');
      equal(get(list, 'name'), 'one', 'name is loaded correctly');
      equal(get(list, 'b'),    true,  'b is loaded correctly');
      equal(get(list, 'day'),    1,  'day is loaded correctly');
      start();
    });
  });
});


test('findQuery', function() {

  stop();
  run(function() {
    store.findQuery('list', {name: /one|two/}).then(function(records) {
      equal(get(records, 'length'), 2, 'found results for /one|two/');
      start();
    });
  });

  stop();
  run(function() {
    store.findQuery('list', {name: /.+/, id: /l1/}).then(function(records) {
      equal(get(records, 'length'), 1, 'found results for {name: /.+/, id: /l1/}');
      start();
    });
  });

  stop();
  run(function() {
    store.findQuery('list', {name: 'one'}).then(function(records) {
      equal(get(records, 'length'), 1, 'found results for name "one"');
      start();
    });
  });

  stop();
  run(function() {
    store.findQuery('list', {b: true}).then(function(records) {
      equal(get(records, 'length'), 1, 'found results for {b: true}');
      start();
    });
  });

  stop();
  run(function() {
    store.findQuery('list', {whatever: "dude"}).then(function(records) {
      equal(get(records, 'length'), 0, 'didn\'t find results for nonsense');
      start();
    });
  });
});


test('findAll', function() {
  expect(7);

  stop();
  run(function() {
    store.findAll('list').then(function(records) {
      var firstRecord  = records.objectAt(0),
          secondRecord = records.objectAt(1),
          thirdRecord  = records.objectAt(2);

      equal(get(records, 'length'), 3, "3 items were found");

      equal(get(firstRecord,  'name'), "one", "First item's name is one");
      equal(get(secondRecord, 'name'), "two", "Second item's name is two");
      equal(get(thirdRecord,  'name'), "three", "Third item's name is three");

      equal(get(firstRecord,  'day'), 1, "First item's day is 1");
      equal(get(secondRecord, 'day'), 2, "Second item's day is 2");
      equal(get(thirdRecord,  'day'), 3, "Third item's day is 3");

      start();
    });
  });
});


test('findQueryMany', function() {
  expect(11);
  stop();
  run(function() {
    store.find('order', { b: true }).then(function(records) {
      var firstRecord = records.objectAt(0),
          secondRecord = records.objectAt(1),
          thirdRecord = records.objectAt(2);

      equal(get(records, 'length'), 3, "3 orders were found");
      equal(get(firstRecord, 'name'), "one", "First order's name is one");
      equal(get(secondRecord, 'name'), "three", "Second order's name is three");
      equal(get(thirdRecord, 'name'), "four", "Third order's name is four");
      var firstHours = firstRecord.get('hours'),
          secondHours = secondRecord.get('hours'),
          thirdHours = thirdRecord.get('hours');

      equal(get(firstHours, 'length'), 2, "Order one has two hours");
      equal(get(secondHours, 'length'), 2, "Order three has two hours");
      equal(get(thirdHours, 'length'), 0, "Order four has no hours");

      var hourOne = firstHours.objectAt(0),
          hourTwo = firstHours.objectAt(1),
          hourThree = secondHours.objectAt(0),
          hourFour = secondHours.objectAt(1);
      equal(get(hourOne, 'amount'), 4, "Hour one has amount of 4");
      equal(get(hourTwo, 'amount'), 3, "Hour two has amount of 3");
      equal(get(hourThree, 'amount'), 2, "Hour three has amount of 2");
      equal(get(hourFour, 'amount'), 1, "Hour four has amount of 1");

      start();
    });
  });
});


test('createRecord', function() {
  expect(3);
  stop();

  run(function() {
    var list = store.createRecord('list', { name: 'Rambo' });

    list.save().then(function(record) {


      store.findQuery('list', { name: 'Rambo' }).then(function(records) {
        var record = records.objectAt(0);

        equal(get(records, 'length'), 1, "Only Rambo was found");
        equal(get(record,  'name'),  "Rambo", "Correct name");
        equal(get(record,  'id'),    list.id, "Correct, original id");
        start();
      });
    });
  });
});


test('updateRecords', function() {
  expect(3);
  stop();

  run(function() {
    var list = store.createRecord('list', { name: 'Rambo' });

    var UpdateList = function(list) {
      return store.findQuery('list', { name: 'Rambo' }).then(function(records) {
        var record = records.objectAt(0);
        record.set('name', 'Macgyver');
        return record.save();
      });
    };

    var AssertListIsUpdated = function() {
      return store.findQuery('list', { name: 'Macgyver' }).then(function(records) {
        var record = records.objectAt(0);

        equal(get(records, 'length'), 1,         "Only one record was found");
        equal(get(record,  'name'),  "Macgyver", "Updated name shows up");
        equal(get(record,  'id'),    list.id,    "Correct, original id");

        start();
      });
    };

    list.save().then(UpdateList).then(AssertListIsUpdated);
  });
});


test('deleteRecord', function() {
  expect(2);
  stop();

  run(function() {
    var AssertListIsDeleted = function() {
      return store.findQuery('list', { name: 'one' }).then(function(records) {
        equal(get(records, 'length'), 0, "No record was found");
        start();
      });
    };

    store.findQuery('list', {name: 'one'}).then(function(lists) {
      var list = lists.objectAt(0);

      equal(get(list, "id"), "l1", "Item exists");

      list.deleteRecord();
      list.on("didDelete", AssertListIsDeleted);
      list.save();
    });
  });
});

test('changes in bulk', function() {
  stop();
  run( function() {

    var listToUpdate = new Ember.RSVP.Promise(function(resolve, reject) {
      store.find('list', 'l1').then(function(list) {
        list.set('name', 'updated');
        list.save().then(function(){
          resolve();
        });
      });
    });

    var listToCreate = new Ember.RSVP.Promise(function(resolve, reject) {
      store.createRecord('list', { name: 'Rambo' }).save().then(function() {
        resolve();
      });
    });

    var listToDelete = new Ember.RSVP.Promise(function(resolve, reject) {
      store.find('list', 'l2').then(function(list) {
        list.destroyRecord().then(function() {
          resolve();
        });
      });
    });

    var promises = [
      listToUpdate,
      listToCreate,
      listToDelete
    ];

    Ember.RSVP.all(promises).then(function() {

      promises    = Ember.A();

      promises.push(
        new Ember.RSVP.Promise(function(resolve, reject) {
          store.find('list', 'l1').then(function(list) {
            equal(get(list, 'name'), 'updated', "Record was updated successfully");
            resolve();
          });
        })
      );

      promises.push(
        new Ember.RSVP.Promise(function(resolve, reject) {
          store.findQuery('list', {name: 'Rambo'}).then(function(lists) {
            equal(get(lists, 'length'), 1, "Record was created successfully");
            resolve();
          });
        })
      );

      promises.push(
        new Ember.RSVP.Promise(function(resolve, reject) {
          store.find('list', 'l2').then(
            function(list) {
            },
            function(list) {
              equal(get(list, 'length'), undefined, "Record was deleted successfully");
              resolve();
            }
          );
        })
      );

      Ember.RSVP.all(promises).then(function() {
        start();
      });
    });
  });
});


test('load hasMany association', function() {
  expect(4);
  stop();

  run( function() {
    store.find('list', 'l1').then(function(list) {
      var items = list.get('items');

      var item1 = items.get('firstObject'),
          item2 = items.get('lastObject');

      equal(get(item1, 'id'),   'i1',  'first item id is loaded correctly');
      equal(get(item1, 'name'), 'one', 'first item name is loaded correctly');
      equal(get(item2, 'id'),   'i2',  'first item id is loaded correctly');
      equal(get(item2, 'name'), 'two', 'first item name is loaded correctly');

      start();
    });
  });
});


test('load belongsTo association', function() {
  stop();
  run(function() {
    store.find('item', 'i1').then(function(item) {
      return new Ember.RSVP.Promise(function(resolve) { resolve(get(item, 'list')); });
    }).then(function(list) {
      equal(get(list, 'id'), 'l1', "id is loaded correctly");
      equal(get(list, 'name'), 'one', "name is loaded correctly");

      start();
    });
  });
});


test('saves belongsTo', function() {
  var item,
      listId = 'l2';

  stop();
  run(function() {
    store.find('list', listId).then(function(list) {
      item = store.createRecord('item', { name: 'three thousand' });
      item.set('list', list);

      return item.save();
    }).then(function(item) {
      store.unloadAll('item');
      return store.find('item', item.get('id'));
    }).then(function(item) {
      var list = item.get('list');
      ok(item.get('list'), 'list is present');
      equal(list.id, listId, 'list is retrieved correctly');
      start();
    });
  });
});

test('saves hasMany', function() {
  var item, list,
      listId = 'l2';

  stop();

  run(function() {
    store.find('list', listId).then(function(list) {
      item = store.createRecord('item', { name: 'three thousand' });
      list.get('items').pushObject(item);

      return list.save();
    }).then(function(list) {
      return item.save();
    }).then(function(item) {
      store.unloadAll('list');
      return store.find('list', listId);
    }).then(function(list) {
      var items = list.get('items'),
          item1 = items.objectAt(0);

      equal(item1.get('name'), 'three thousand', 'item is saved');
      start();
    });
  });
});



