import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import FIXTURES from '../helpers/fixtures/crud';
import MOCK_FIXTURES from '../helpers/fixtures/mock';

var App;
var store;
var adapter;
var run = Ember.run;
var get = Ember.get;

module("CRUD", {
  beforeEach: function(assert) {
    let done = assert.async();
    run(function() {
      window.localforage.setItem('DS.LFAdapter', FIXTURES).then(function() {
        window.localforage.setItem('MockAdapter', MOCK_FIXTURES).then(function() {
          done();
        });
      });
    });

    run(function() {
      App = startApp();
      store = App.__container__.lookup('service:store');
      adapter = App.__container__.lookup('adapter:application');
      adapter.get('cache').clear();
    });
  },

  afterEach: function() {
    destroyApp(App);
  }
});

// Lifecycle methods
// -----------------------------------------------------------------------------

test("push", function(assert) {
  assert.expect(3);
  let done = assert.async();

  run(function() {
    var list = store.push({
      data: {
        type: 'list',
        id: adapter.generateIdForRecord(),
        attributes: {
          name: 'Rambo'
        }
      }
    });

    list.save().then(function() {
      return store.query('list', {
        name: 'Rambo'
      });
    }).then(function(records) {
      var record = records.objectAt(0);
      assert.equal(get(records, 'length'), 1, "Only Rambo was found");
      assert.equal(get(record, 'name'), "Rambo", "Correct name");
      assert.equal(get(record, 'id'), list.id, "Correct, original id");
      done();
    });
  });
});

test("createRecord", function(assert) {
  assert.expect(3);
  let done = assert.async();

  run(function() {
    var list = store.createRecord('list', {
      name: 'Rambo'
    });

    list.save().then(function() {
      return store.query('list', {
        name: 'Rambo'
      });
    }).then(function(records) {
      var record = records.objectAt(0);
      assert.equal(get(records, 'length'), 1, "Only Rambo was found");
      assert.equal(get(record, 'name'), "Rambo", "Correct name");
      assert.equal(get(record, 'id'), list.id, "Correct, original id");
      done();
    });
  });
});

test("updateRecord", function(assert) {
  assert.expect(3);
  let done = assert.async();

  run(function() {
    var list = store.createRecord('list', {
      name: 'Rambo'
    });

    var UpdateList = function() {
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
        assert.equal(get(records, 'length'), 1, "Only one record was found");
        assert.equal(get(record, 'name'), "Macgyver", "Updated name shows up");
        assert.equal(get(record, 'id'), list.id, "Correct, original id");
        done();
      });
    };

    list.save().then(UpdateList).then(AssertListIsUpdated);
  });
});

test("deleteRecord", function(assert) {
  assert.expect(2);
  let done = assert.async();

  run(function() {
    var AssertListIsDeleted = function() {
      return store.query('list', {
        name: 'one'
      }).then(function(records) {
        assert.equal(get(records, 'length'), 0, "No record was found");
        done();
      });
    };

    store.query('list', {
      name: 'one'
    }).then(function(lists) {
      var list = lists.objectAt(0);
      assert.equal(get(list, "id"), "l1", "Item exists");
      list.deleteRecord();
      list.on("didDelete", AssertListIsDeleted);
      list.save();
    });
  });
});

// Find methods
// -----------------------------------------------------------------------------

test("findAll", function(assert) {
  assert.expect(7);

  let done = assert.async();
  run(function() {
    store.findAll('list').then(function(records) {
      var firstRecord = records.objectAt(0);
      var secondRecord = records.objectAt(1);
      var thirdRecord = records.objectAt(2);

      assert.equal(get(records, 'length'), 3, "3 items were found");

      assert.equal(get(firstRecord, 'name'), "one", "First item's name is one");
      assert.equal(get(secondRecord, 'name'), "two", "Second item's name is two");
      assert.equal(get(thirdRecord, 'name'), "three", "Third item's name is three");

      assert.equal(get(firstRecord, 'day'), 1, "First item's day is 1");
      assert.equal(get(secondRecord, 'day'), 2, "Second item's day is 2");
      assert.equal(get(thirdRecord, 'day'), 3, "Third item's day is 3");

      done();
    });
  });
});

test("findRecord", function(assert) {
  assert.expect(4);

  let done = assert.async();
  run(function() {
    store.findRecord('list', 'l1').then(function(list) {
      assert.equal(get(list, 'id'), 'l1', "id is loaded correctly");
      assert.equal(get(list, 'name'), 'one', "name is loaded correctly");
      assert.equal(get(list, 'b'), true, "b is loaded correctly");
      assert.equal(get(list, 'day'), 1, "day is loaded correctly");
      done();
    });
  });
});

// Query methods
// -----------------------------------------------------------------------------

test("query", function(assert) {
  assert.expect(7);

  let done1 = assert.async();
  run(function() {
    store.query('list', {
      name: /one|two/
    }).then(function(records) {
      assert.equal(get(records, 'length'), 2, "found results for /one|two/");
      done1();
    });
  });

  let done2 = assert.async();
  run(function() {
    store.query('list', {
      name: /.+/,
      id: /l1/
    }).then(function(records) {
      assert.equal(get(records, 'length'), 1, "found results for { name: /.+/, id: /l1/ }");
      done2();
    });
  });

  let done3 = assert.async();
  run(function() {
    store.query('list', {
      name: 'one'
    }).then(function(records) {
      assert.equal(get(records, 'length'), 1, "found results for name 'one'");
      done3();
    });
  });

  let done4 = assert.async();
  run(function() {
    store.query('list', {
      b: true
    }).then(function(records) {
      assert.equal(get(records, 'length'), 1, "found results for { b: true }");
      done4();
    });
  });

  let done5 = assert.async();
  run(function() {
    store.query('list', {
      name: 'two',
      b: false
    }).then(function(records) {
      assert.equal(get(records, 'length'), 1, "found results for multiple criteria");
      done5();
    });
  });

  let done6 = assert.async();
  run(function() {
    store.query('list', {
      name: 'four',
      b: false
    }).then(function(records) {
      assert.equal(get(records, 'length'), 0, "found no results when only criteria matches");
      done6();
    });
  });

  let done7 = assert.async();
  run(function() {
    store.query('list', {
      whatever: "dude"
    }).then(function(records) {
      assert.equal(get(records, 'length'), 0, "didn't find results for nonsense");
      done7();
    });
  });
});

test("queryRecord", function(assert) {
  assert.expect(5);

  let done1 = assert.async();
  run(function() {
    store.queryRecord('list', {
      name: 'one'
    }).then(function(list) {
      assert.equal(get(list, 'id'), 'l1', "id is loaded correctly");
      assert.equal(get(list, 'name'), 'one', "name is loaded correctly");
      assert.equal(get(list, 'b'), true, "b is loaded correctly");
      assert.equal(get(list, 'day'), 1, "day is loaded correctly");
      done1();
    });
  });

  let done2 = assert.async();
  run(function() {
    store.queryRecord('list', {
      whatever: "dude"
    }).catch(function() {
      assert.ok(true, "didn't find record for nonsense");
      done2();
    });
  });
});

// Relationship loading
//------------------------------------------------------------------------------

function assertionsForHasManyRelationships(assert, done, items) {
  assert.expect(4);
  var item1 = items.get('firstObject');
  var item2 = items.get('lastObject');
  assert.equal(get(item1, 'id'), 'i1', "first item id is loaded correctly");
  assert.equal(get(item1, 'name'), 'one', "first item name is loaded correctly");
  assert.equal(get(item2, 'id'), 'i2', "first item id is loaded correctly");
  assert.equal(get(item2, 'name'), 'two', "first item name is loaded correctly");
  done();
}

test("load hasMany relationships when finding a single record", function(assert) {
  let done = assert.async();

  run(function() {
    store.findRecord('list', 'l1').then(function(list) {
      list.get('items').then(function(items) {
        assertionsForHasManyRelationships(assert, done, items);
      });
    });
  });
});
test("load hasMany relationships when finding multiple records", function(assert) {
  let done = assert.async();

  run(function() {
    store.findAll('list').then(function(lists) {
      lists.get('firstObject.items').then(function(items) {
        assertionsForHasManyRelationships(assert, done, items);
      });
    });
  });
});

function assertionsForMissingHasManyRelationships(assert, done, post) {
  assert.expect(2);
  var p1 = post.get('comments').catch(function() {
    assert.ok(true, "Missing comments prevent all comments from being loaded");
  });
  var p2 = post.get('subscribers').catch(function() {
    assert.ok(true, "Missing external subscribers prevent all comments from being loaded");
  });
  Ember.RSVP.all([p1, p2]).then(function() {
    done();
  });
}

test("load with missing hasMany relationships when finding a single record", function(assert) {
  let done = assert.async();

  run(function() {
    store.findRecord('post', 'p1').then(function(post) {
      assertionsForMissingHasManyRelationships(assert, done, post);
    });
  });
});

test("load with missing hasMany relationships when finding multiple records", function(assert) {
  let done = assert.async();

  run(function() {
    store.findAll('post').then(function(posts) {
      assertionsForMissingHasManyRelationships(assert, done, posts.get('firstObject'));
    });
  });
});

function assertionsForBelongsToRelationships(assert, done, list) {
  assert.equal(get(list, 'id'), 'l1', "id is loaded correctly");
  assert.equal(get(list, 'name'), 'one', "name is loaded correctly");
  done();
}

test("load belongsTo relationships when finding a single record", function(assert) {
  let done = assert.async();
  run(function() {
    store.findRecord('item', 'i1').then(function(item) {
      item.get('list').then(function(list) {
        assertionsForBelongsToRelationships(assert, done, list);
      });
    });
  });
});

test("load belongsTo relationships when finding multiple records", function(assert) {
  let done = assert.async();

  run(function() {
    store.findAll('item').then(function(items) {
      items.get('firstObject.list').then(function(list) {
        assertionsForBelongsToRelationships(assert, done, list);
      });
    });
  });
});

test("load with missing belongsTo relationships when finding a single record", function(assert) {
  assert.expect(2);
  let done = assert.async();

  run(function() {
    var p1 = store.findRecord('comment', 'c2').then(function(comment) {
      return comment.get('post').catch(function() {
        assert.ok(true, "Related post can\'t be resolved");
      });
    });
    var p2 = store.findRecord('comment', 'c4').then(function(comment) {
      return comment.get('author').catch(function() {
        assert.ok(true, "External related author can\'t be resolved");
      });
    });
    Ember.RSVP.all([p1, p2]).then(function() {
      done();
    });
  });
});

test("load with missing belongsTo relationships when finding multiple records", function(assert) {
  assert.expect(2);
  let done = assert.async();

  run(function() {
    store.findAll('comment').then(function(comments) {
      var p1 = comments.objectAt(1).get('post').catch(function() {
        assert.ok(true, "Related post can\'t be resolved");
      });
      var p2 = comments.objectAt(3).get('author').catch(function() {
        assert.ok(true, "External related author can\'t be resolved");
      });
      Ember.RSVP.all([p1, p2]).then(function() {
        done();
      });
    });
  });
});

test("load embedded hasMany relationships when finding a single record", function(assert) {
  assert.expect(5);

  let done = assert.async();

  run(function() {
    store.findRecord('customer', '1').then(function(customer) {
      var addresses = customer.get('addresses');
      assert.equal(addresses.length, 2);

      var address1 = addresses.get('firstObject');
      var address2 = addresses.get('lastObject');
      assert.equal(get(address1, 'id'), '1',
        "first address id is loaded correctly");
      assert.equal(get(address1, 'addressNumber'), '12345',
        "first address number is loaded correctly");
      assert.equal(get(address2, 'id'), '2',
        "first address id is loaded correctly");
      assert.equal(get(address2, 'addressNumber'), '54321',
        "first address number is loaded correctly");

      done();
    });
  });
});

test("load embedded hasMany relationships when finding multiple records", function(assert) {
  assert.expect(6);

  let done = assert.async();

  run(function() {
    store.findAll('customer').then(function(customers) {
      assert.equal(get(customers, 'length'), 1, 'one customer was retrieved');

      var customer = customers.objectAt(0);
      var addresses = customer.get('addresses');
      assert.equal(addresses.length, 2);

      var address1 = addresses.get('firstObject');
      var address2 = addresses.get('lastObject');
      assert.equal(get(address1, 'id'), '1',
        "first address id is loaded correctly");
      assert.equal(get(address1, 'addressNumber'), '12345',
        "first address number is loaded correctly");
      assert.equal(get(address2, 'id'), '2',
        "first address id is loaded correctly");
      assert.equal(get(address2, 'addressNumber'), '54321',
        "first address number is loaded correctly");

      done();
    });
  });
});

test("load embedded hasMany relationships when querying multiple records", function(assert) {
  assert.expect(6);

  let done = assert.async();

  run(function() {
    store.query('customer', {
      customerNumber: '123'
    }).then(function(customers) {
      assert.equal(get(customers, 'length'), 1);

      var customer = customers.objectAt(0);
      var addresses = customer.get('addresses');
      assert.equal(addresses.length, 2);

      var address1 = addresses.get('firstObject');
      var address2 = addresses.get('lastObject');
      assert.equal(get(address1, 'id'), '1',
        "first address id is loaded correctly");
      assert.equal(get(address1, 'addressNumber'), '12345',
        "first address number is loaded correctly");
      assert.equal(get(address2, 'id'), '2',
        "first address id is loaded correctly");
      assert.equal(get(address2, 'addressNumber'), '54321',
        "first address number is loaded correctly");

      done();
    });
  });
});

test("load embedded belongsTo relationships when finding a single record", function(assert) {
  assert.expect(2);

  let done = assert.async();

  run(function() {
    store.findRecord('customer', '1').then(function(customer) {
      var hour = customer.get('hour');
      assert.equal(get(hour, 'id'), 'h5',
        "hour id is loaded correctly");
      assert.equal(get(hour, 'name'), 'five',
        "hour name is loaded correctly");

      done();
    });
  });
});

test("load hasMany relationships when querying multiple records", function(assert) {
  assert.expect(11);
  let done = assert.async();
  run(function() {
    store.query('order', {
      b: true
    }).then(function(records) {
      var firstRecord = records.objectAt(0);
      var secondRecord = records.objectAt(1);
      var thirdRecord = records.objectAt(2);
      assert.equal(get(records, 'length'), 3, "3 orders were found");
      assert.equal(get(firstRecord, 'name'), "one", "First order's name is one");
      assert.equal(get(secondRecord, 'name'), "three", "Second order's name is three");
      assert.equal(get(thirdRecord, 'name'), "four", "Third order's name is four");


      Ember.RSVP.all([
        firstRecord.get('hours'),
        secondRecord.get('hours'),
        thirdRecord.get('hours')
      ]).then(function(hours) {
        var firstHours = hours[0];
        var secondHours = hours[1];
        var thirdHours = hours[2];
        assert.equal(get(firstHours, 'length'), 2, "Order one has two hours");
        assert.equal(get(secondHours, 'length'), 2, "Order three has two hours");
        assert.equal(get(thirdHours, 'length'), 0, "Order four has no hours");

        var hourOne = firstHours.objectAt(0);
        var hourTwo = firstHours.objectAt(1);
        var hourThree = secondHours.objectAt(0);
        var hourFour = secondHours.objectAt(1);
        assert.equal(get(hourOne, 'amount'), 4, "Hour one has amount of 4");
        assert.equal(get(hourTwo, 'amount'), 3, "Hour two has amount of 3");
        assert.equal(get(hourThree, 'amount'), 2, "Hour three has amount of 2");
        assert.equal(get(hourFour, 'amount'), 1, "Hour four has amount of 1");

        done();
      });
    });
  });
});

// Relationship saving
//------------------------------------------------------------------------------

test("save belongsTo relationships", function(assert) {
  var listId = 'l2';

  let done = assert.async();
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
        assert.ok(item.get('list'), "list is present");
        assert.equal(list.id, listId, "list is retrieved correctly");
        done();
      });
    });
  });
});

test("save hasMany relationships", function(assert) {
  var listId = 'l2';

  let done = assert.async();
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
        assert.equal(item1.get('name'), 'three thousand', "item is saved");
        done();
      });
    });
  });
});

// Bulk operations
//------------------------------------------------------------------------------

test("perform multiple changes in bulk", function(assert) {
  let done = assert.async();
  run(function() {

    var listToUpdate = new Ember.RSVP.Promise(function(resolve) {
      store.findRecord('list', 'l1').then(function(list) {
        list.set('name', 'updated');
        list.save().then(function() {
          resolve();
        });
      });
    });

    var listToCreate = new Ember.RSVP.Promise(function(resolve) {
      store.createRecord('list', {
        name: 'Rambo'
      }).save().then(function() {
        resolve();
      });
    });

    var listToDelete = new Ember.RSVP.Promise(function(resolve) {
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
        new Ember.RSVP.Promise(function(resolve) {
          store.findRecord('list', 'l1').then(function(list) {
            assert.equal(get(list, 'name'), 'updated', "Record was updated successfully");
            resolve();
          });
        })
      );

      promises.push(
        new Ember.RSVP.Promise(function(resolve) {
          store.query('list', {
            name: 'Rambo'
          }).then(function(lists) {
            assert.equal(get(lists, 'length'), 1, "Record was created successfully");
            resolve();
          });
        })
      );

      promises.push(
        new Ember.RSVP.Promise(function(resolve) {
          store.findRecord('list', 'l2').catch(function() {
            assert.ok(true, "Record was deleted successfully");
            resolve();
          });
        })
      );

      Ember.RSVP.all(promises).then(function() {
        done();
      });
    });
  });
});