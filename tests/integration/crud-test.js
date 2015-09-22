import Ember from 'ember';
import {
  test
}
from 'ember-qunit';
import startApp from '../helpers/start-app';
import FIXTURES from '../helpers/fixtures/crud';

var App;
var store;
var adapter;
var server;
var run = Ember.run;
var get = Ember.get;
var set = Ember.set;

module("CRUD", {
  setup: function() {
    stop();
    run(function() {
      window.localforage.setItem('DS.LFAdapter', FIXTURES).then(function() {
        start();
      });
    });

    run(function() {
      App = startApp();
      store = App.__container__.lookup('service:store');
      adapter = App.__container__.lookup('adapter:application');
      adapter.get('cache').clear();
    });
  },

  teardown: function() {
    run(App, 'destroy');
  }
});

// Lifecycle methods
// -----------------------------------------------------------------------------

test("push", function() {
  expect(3);
  stop();

  run(function() {
    var list = store.push({
      type: 'list',
      id: adapter.generateIdForRecord(),
      attributes: {
        name: 'Rambo'
      }
    });

    list.save().then(function(record) {
      return store.query('list', {
        name: 'Rambo'
      });
    }).then(function(records) {
      var record = records.objectAt(0);
      equal(get(records, 'length'), 1, "Only Rambo was found");
      equal(get(record, 'name'), "Rambo", "Correct name");
      equal(get(record, 'id'), list.id, "Correct, original id");
      start();
    });
  });
});

test("createRecord", function() {
  expect(3);
  stop();

  run(function() {
    var list = store.createRecord('list', {
      name: 'Rambo'
    });

    list.save().then(function(record) {
      return store.query('list', {
        name: 'Rambo'
      });
    }).then(function(records) {
      var record = records.objectAt(0);
      equal(get(records, 'length'), 1, "Only Rambo was found");
      equal(get(record, 'name'), "Rambo", "Correct name");
      equal(get(record, 'id'), list.id, "Correct, original id");
      start();
    });
  });
});

test("updateRecord", function() {
  expect(3);
  stop();

  run(function() {
    var list = store.createRecord('list', {
      name: 'Rambo'
    });

    var UpdateList = function(list) {
      return store.query('list', {
        name: 'Rambo'
      }).then(function(records) {
        var record = records.objectAt(0);
        record.set('name', 'Macgyver');
        return record.save();
      });
    };

    var AssertListIsUpdated = function() {
      return store.query('list', {
        name: 'Macgyver'
      }).then(function(records) {
        var record = records.objectAt(0);
        equal(get(records, 'length'), 1, "Only one record was found");
        equal(get(record, 'name'), "Macgyver", "Updated name shows up");
        equal(get(record, 'id'), list.id, "Correct, original id");
        start();
      });
    };

    list.save().then(UpdateList).then(AssertListIsUpdated);
  });
});

test("deleteRecord", function() {
  expect(2);
  stop();

  run(function() {
    var AssertListIsDeleted = function() {
      return store.query('list', {
        name: 'one'
      }).then(function(records) {
        equal(get(records, 'length'), 0, "No record was found");
        start();
      });
    };

    store.query('list', {
      name: 'one'
    }).then(function(lists) {
      var list = lists.objectAt(0);
      equal(get(list, "id"), "l1", "Item exists");
      list.deleteRecord();
      list.on("didDelete", AssertListIsDeleted);
      list.save();
    });
  });
});

// Find methods
// -----------------------------------------------------------------------------

test("findAll", function() {
  expect(7);

  stop();
  run(function() {
    store.findAll('list').then(function(records) {
      var firstRecord = records.objectAt(0);
      var secondRecord = records.objectAt(1);
      var thirdRecord = records.objectAt(2);

      equal(get(records, 'length'), 3, "3 items were found");

      equal(get(firstRecord, 'name'), "one", "First item's name is one");
      equal(get(secondRecord, 'name'), "two", "Second item's name is two");
      equal(get(thirdRecord, 'name'), "three", "Third item's name is three");

      equal(get(firstRecord, 'day'), 1, "First item's day is 1");
      equal(get(secondRecord, 'day'), 2, "Second item's day is 2");
      equal(get(thirdRecord, 'day'), 3, "Third item's day is 3");

      start();
    });
  });
});

test("findRecord", function() {
  expect(4);

  stop();
  run(function() {
    store.findRecord('list', 'l1').then(function(list) {
      equal(get(list, 'id'), 'l1', "id is loaded correctly");
      equal(get(list, 'name'), 'one', "name is loaded correctly");
      equal(get(list, 'b'), true, "b is loaded correctly");
      equal(get(list, 'day'), 1, "day is loaded correctly");
      start();
    });
  });
});

// Query methods
// -----------------------------------------------------------------------------

test("query", function() {

  stop();
  run(function() {
    store.query('list', {
      name: /one|two/
    }).then(function(records) {
      equal(get(records, 'length'), 2, "found results for /one|two/");
      start();
    });
  });

  stop();
  run(function() {
    store.query('list', {
      name: /.+/,
      id: /l1/
    }).then(function(records) {
      equal(get(records, 'length'), 1, "found results for { name: /.+/, id: /l1/ }");
      start();
    });
  });

  stop();
  run(function() {
    store.query('list', {
      name: 'one'
    }).then(function(records) {
      equal(get(records, 'length'), 1, "found results for name 'one'");
      start();
    });
  });

  stop();
  run(function() {
    store.query('list', {
      b: true
    }).then(function(records) {
      equal(get(records, 'length'), 1, "found results for { b: true }");
      start();
    });
  });

  stop();
  run(function() {
    store.query('list', {
      name: 'two',
      b: false
    }).then(function(records) {
      equal(get(records, 'length'), 1, "found results for multiple criteria");
      start();
    });
  });

  stop();
  run(function() {
    store.query('list', {
      name: 'four',
      b: false
    }).then(function(records) {
      equal(get(records, 'length'), 0, "found no results when only criteria matches");
      start();
    });
  });

  stop();
  run(function() {
    store.query('list', {
      whatever: "dude"
    }).then(function(records) {
      equal(get(records, 'length'), 0, "didn't find results for nonsense");
      start();
    });
  });
});

test("queryRecord", function() {

  stop();
  run(function() {
    store.queryRecord('list', {
      name: 'one'
    }).then(function(list) {
      equal(get(list, 'id'), 'l1', "id is loaded correctly");
      equal(get(list, 'name'), 'one', "name is loaded correctly");
      equal(get(list, 'b'), true, "b is loaded correctly");
      equal(get(list, 'day'), 1, "day is loaded correctly");
      start();
    });
  });

  stop();
  run(function() {
    store.queryRecord('list', {
      whatever: "dude"
    }).catch(function(err) {
      ok(true, "didn't find record for nonsense");
      start();
    });
  });
});

// Relationship loading
//------------------------------------------------------------------------------

test("load hasMany relationships when finding a single record", function() {
  expect(4);
  stop();

  run(function() {
    store.findRecord('list', 'l1').then(function(list) {
      list.get('items').then(function(items) {
        var item1 = items.get('firstObject');
        var item2 = items.get('lastObject');
        equal(get(item1, 'id'), 'i1', "first item id is loaded correctly");
        equal(get(item1, 'name'), 'one', "first item name is loaded correctly");
        equal(get(item2, 'id'), 'i2', "first item id is loaded correctly");
        equal(get(item2, 'name'), 'two', "first item name is loaded correctly");
        start();
      });
    });
  });
});

test("load belongsTo relationships when finding a single record", function() {
  stop();
  run(function() {
    store.findRecord('item', 'i1').then(function(item) {
      item.get('list').then(function(list) {
        equal(get(list, 'id'), 'l1', "id is loaded correctly");
        equal(get(list, 'name'), 'one', "name is loaded correctly");
        start();
      });
    });
  });
});

test("load embedded hasMany relationships when finding a single record", function() {
  expect(5);

  stop();

  run(function() {
    store.findRecord('customer', '1').then(function(customer) {
      var addresses = customer.get('addresses');
      equal(addresses.length, 2);

      var address1 = addresses.get('firstObject');
      var address2 = addresses.get('lastObject');
      equal(get(address1, 'id'), '1',
        "first address id is loaded correctly");
      equal(get(address1, 'addressNumber'), '12345',
        "first address number is loaded correctly");
      equal(get(address2, 'id'), '2',
        "first address id is loaded correctly");
      equal(get(address2, 'addressNumber'), '54321',
        "first address number is loaded correctly");

      start();
    });
  });
});

test("load embedded hasMany relationships when finding multiple records", function() {
  expect(6);

  stop();

  run(function() {
    store.findAll('customer').then(function(customers) {
      equal(get(customers, 'length'), 1, 'one customer was retrieved');

      var customer = customers.objectAt(0);
      var addresses = customer.get('addresses');
      equal(addresses.length, 2);

      var address1 = addresses.get('firstObject');
      var address2 = addresses.get('lastObject');
      equal(get(address1, 'id'), '1',
        "first address id is loaded correctly");
      equal(get(address1, 'addressNumber'), '12345',
        "first address number is loaded correctly");
      equal(get(address2, 'id'), '2',
        "first address id is loaded correctly");
      equal(get(address2, 'addressNumber'), '54321',
        "first address number is loaded correctly");

      start();
    });
  });
});

test("load embedded hasMany relationships when querying multiple records", function() {
  expect(6);

  stop();

  run(function() {
    store.query('customer', {
      customerNumber: '123'
    }).then(function(customers) {
      equal(get(customers, 'length'), 1);

      var customer = customers.objectAt(0);
      var addresses = customer.get('addresses');
      equal(addresses.length, 2);

      var address1 = addresses.get('firstObject');
      var address2 = addresses.get('lastObject');
      equal(get(address1, 'id'), '1',
        "first address id is loaded correctly");
      equal(get(address1, 'addressNumber'), '12345',
        "first address number is loaded correctly");
      equal(get(address2, 'id'), '2',
        "first address id is loaded correctly");
      equal(get(address2, 'addressNumber'), '54321',
        "first address number is loaded correctly");

      start();
    });
  });
});

test("load embedded belongsTo relationships when finding a single record", function() {
  expect(2);

  stop();

  run(function() {
    store.findRecord('customer', '1').then(function(customer) {
      var hour = customer.get('hour');
      equal(get(hour, 'id'), 'h5',
        "hour id is loaded correctly");
      equal(get(hour, 'name'), 'five',
        "hour name is loaded correctly");

      start();
    });
  });
});

test("load hasMany relationships when querying multiple records", function() {
  expect(11);
  stop();
  run(function() {
    store.query('order', {
      b: true
    }).then(function(records) {
      var firstRecord = records.objectAt(0);
      var secondRecord = records.objectAt(1);
      var thirdRecord = records.objectAt(2);
      equal(get(records, 'length'), 3, "3 orders were found");
      equal(get(firstRecord, 'name'), "one", "First order's name is one");
      equal(get(secondRecord, 'name'), "three", "Second order's name is three");
      equal(get(thirdRecord, 'name'), "four", "Third order's name is four");

      
      Ember.RSVP.all([
        firstRecord.get('hours'),
        secondRecord.get('hours'),
        thirdRecord.get('hours')
      ]).then(function(hours) {
        var firstHours = hours[0];
        var secondHours = hours[1];
        var thirdHours = hours[2];
        equal(get(firstHours, 'length'), 2, "Order one has two hours");
        equal(get(secondHours, 'length'), 2, "Order three has two hours");
        equal(get(thirdHours, 'length'), 0, "Order four has no hours");

        var hourOne = firstHours.objectAt(0);
        var hourTwo = firstHours.objectAt(1);
        var hourThree = secondHours.objectAt(0);
        var hourFour = secondHours.objectAt(1);
        equal(get(hourOne, 'amount'), 4, "Hour one has amount of 4");
        equal(get(hourTwo, 'amount'), 3, "Hour two has amount of 3");
        equal(get(hourThree, 'amount'), 2, "Hour three has amount of 2");
        equal(get(hourFour, 'amount'), 1, "Hour four has amount of 1");

        start();
      });
    });
  });
});

// Relationship saving
//------------------------------------------------------------------------------

test("save belongsTo relationships", function() {
  var listId = 'l2';

  stop();
  run(function() {
    store.findRecord('list', listId).then(function(list) {
      var item = store.createRecord('item', {
        name: 'three thousand'
      });
      item.set('list', list);
      return item.save();
    }).then(function(item) {
      store.unloadAll('item');
      return store.findRecord('item', item.get('id'));
    }).then(function(item) {
      item.get('list').then(function(list) {
        ok(item.get('list'), "list is present");
        equal(list.id, listId, "list is retrieved correctly");
        start();
      });
    });
  });
});

test("save hasMany relationships", function() {
  var listId = 'l2';

  stop();
  run(function() {
    store.findRecord('list', listId).then(function(list) {
      var item = store.createRecord('item', {
        name: 'three thousand'
      });
      return list.get('items').then(function(items) {
        items.pushObject(item);
        return item.save().then(function() {
          return list.save();
        });
      });
    }).then(function() {
      store.unloadAll('list');
      return store.findRecord('list', listId);
    }).then(function(list) {
      list.get('items').then(function(items) {
        var item1 = items.objectAt(0);
        equal(item1.get('name'), 'three thousand', "item is saved");
        start();
      });
    });
  });
});

// Bulk operations
//------------------------------------------------------------------------------

test("perform multiple changes in bulk", function() {
  stop();
  run(function() {

    var listToUpdate = new Ember.RSVP.Promise(function(resolve, reject) {
      store.findRecord('list', 'l1').then(function(list) {
        list.set('name', 'updated');
        list.save().then(function() {
          resolve();
        });
      });
    });

    var listToCreate = new Ember.RSVP.Promise(function(resolve, reject) {
      store.createRecord('list', {
        name: 'Rambo'
      }).save().then(function() {
        resolve();
      });
    });

    var listToDelete = new Ember.RSVP.Promise(function(resolve, reject) {
      store.findRecord('list', 'l2').then(function(list) {
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

      promises = Ember.A();

      promises.push(
        new Ember.RSVP.Promise(function(resolve, reject) {
          store.findRecord('list', 'l1').then(function(list) {
            equal(get(list, 'name'), 'updated', "Record was updated successfully");
            resolve();
          });
        })
      );

      promises.push(
        new Ember.RSVP.Promise(function(resolve, reject) {
          store.query('list', {
            name: 'Rambo'
          }).then(function(lists) {
            equal(get(lists, 'length'), 1, "Record was created successfully");
            resolve();
          });
        })
      );

      promises.push(
        new Ember.RSVP.Promise(function(resolve, reject) {
          store.findRecord('list', 'l2').catch(function(err) {
            ok(true, "Record was deleted successfully");
            resolve();
          });
        })
      );

      Ember.RSVP.all(promises).then(function() {
        start();
      });
    });
  });
});