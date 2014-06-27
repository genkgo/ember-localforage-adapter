Ember Data Localforage Adapter
================================

Store your ember application data in localforage.

Compatible with Ember Data 1.0.beta.6.

Usage
-----

Include `localforage_adapter.js` in your app and then like all adapters:

```js
App.ApplicationSerializer = DS.FSSerializer.extend();
App.ApplicationAdapter = DS.FSAdapter.extend({
    namespace: 'yournamespace'
});
```

### Localforage Namespace

All of your application data lives on a single `localforage` key, it defaults to `DS.LFAdapter` but if you supply a `namespace` option it will store it there:

```js
DS.LFAdapter.create({
  namespace: 'my app'
});
```

Todo
----

- see if tests are working 
- stop using a queue, put each record type in an own namespace

Tests (working on this, currently 45/47 passed)
-----------------------------------------------

If you don't have bower, install it with

    npm install bower -g

Then install the dependencies with

    bower install

Open `tests/index.html` in a browser. If you have `phantomjs` installed,
run

    phantomjs test/runner.js test/index.html

    
Localforage Adapter License & Copyright
--------------------------------------------------

Copyright (c) 2012 Genkgo BV
MIT Style license. http://opensource.org/licenses/MIT


Original LocalStorage Adapter License & Copyright
--------------------------------------------------

Copyright (c) 2012 Ryan Florence
MIT Style license. http://opensource.org/licenses/MIT
