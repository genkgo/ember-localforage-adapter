Ember Data Localforage Adapter
================================

Store your ember application data in [Mozilla's localForage](https://github.com/mozilla/localForage). Compatible with [Ember Data 1.0.beta.14](https://github.com/emberjs/data).

"localForage is a JavaScript library that improves the offline experience of your web app by using asynchronous storage (via IndexedDB or WebSQL where available) with a simple, localStorage-like API."

It is supported by all major browsers, including mobile.

Usage
-----

Include `localforage_adapter.js` in your app and then like all adapters:

```js
App.ApplicationSerializer = DS.LFSerializer.extend();
App.ApplicationAdapter = DS.LFAdapter.extend({
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

### Cache

In order to reduce the number of getItem calls to localforage, you can specify a caching mechanism.

```js
DS.LFAdapter.create({
  caching: 'model|all|none'
});
```

While `all` will reduce the number of calls to getItem (for reading) to only one, you will fetch all your data in memory. The default
behaviour therefore is `model`. This means: if you query one model, it will fetch all the items of that model from localforage.


Support
----

The adapter is available in the current versions of all major browsers: Chrome, Firefox, IE, and Safari (including Safari Mobile). localStorage is used for browsers with no IndexedDB or WebSQL support. See [Mozilla's localForage](https://github.com/mozilla/localForage) for an updated detailed compatibility info.

* **Android Browser 2.1** 
* **Blackberry 7**
* **Chrome 23** (Chrome 4.0+ with localStorage)
* **Chrome for Android 32**
* **Firefox 10** (Firefox 3.5+ with localStorage)
* **Firefox for Android 25**
* **Firefox OS 1.0**
* **IE 10** (IE 8+ with localStorage)
* **IE Mobile 10**
* **Opera 15** (Opera 10.5+ with localStorage)
* **Opera Mobile 11**
* **Phonegap/Apache Cordova 1.2.0**
* **Safari 3.1** (includes Mobile Safari)


Tests (46/47 should pass)
-----------------------------------------------

The tests are the same one as for the [localstorage adapter](https://github.com/rpflorence/ember-localstorage-adapter). Currently 46/47 of these tests are passing. If you don't have bower, install it with

    npm install bower -g

Then install both npm and bower dependencies with

    bower install
    npm install

Open `tests/index.html` in a browser. If you have `phantomjs` installed,
run

    ember test

    
Localforage Adapter License & Copyright
--------------------------------------------------

Copyright (c) 2012 Genkgo BV
MIT Style license. http://opensource.org/licenses/MIT


Original LocalStorage Adapter License & Copyright
--------------------------------------------------

Copyright (c) 2012 Ryan Florence
MIT Style license. http://opensource.org/licenses/MIT
