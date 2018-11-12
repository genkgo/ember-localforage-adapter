Ember Data Localforage Adapter
================================

Store your ember application data in [Mozilla's localForage](https://github.com/mozilla/localForage). Compatible with [Ember Data 3.0](https://github.com/emberjs/data).

"localForage is a JavaScript library that improves the offline experience of your web app by using asynchronous storage (via IndexedDB or WebSQL where available) with a simple, localStorage-like API."

It is supported by all major browsers, including mobile.

[![Build Status](https://travis-ci.org/genkgo/ember-localforage-adapter.png?branch=master)](https://travis-ci.org/genkgo/ember-localforage-adapter)
[![npm version](https://badge.fury.io/js/ember-localforage-adapter.svg)](http://badge.fury.io/js/ember-localforage-adapter)
[![Bower version](https://badge.fury.io/bo/ember-localforage-adapter.svg)](http://badge.fury.io/bo/ember-localforage-adapter)
[![Ember Observer Score](http://emberobserver.com/badges/ember-localforage-adapter.svg)](http://emberobserver.com/addons/ember-localforage-adapter)

Usage
-----

Install the addon using ember cli

```
ember install ember-localforage-adapter
```

Initialize the adapter.

```js
//app/adapters/application.js
import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

export default LFAdapter;
```

For a more thorough introduction how to use this adapter, please read [Models and application data](https://developer.mozilla.org/en-US/Apps/Build/Modern_web_app_architecture/Models_and_application_data) on the MDN website of Mozilla.

### Localforage Namespace

All of your application data lives on a single `localforage` key, it defaults to `DS.LFAdapter` but if you supply a `namespace` option it will store it there:

```js
//app/adapters/user.js
import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

export default LFAdapter.extend({
  namespace: 'users'
});
```

### Cache

In order to reduce the number of getItem calls to localforage, you can specify a caching mechanism.

```js
import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

export default LFAdapter.extend({
  caching: 'model|all|none'
});
```

While `all` will reduce the number of calls to getItem (for reading) to only one, you will fetch all your data in memory. The default
behaviour therefore is `model`. This means: if you query one model, it will fetch all the items of that model from localforage.

### Embedded records

Since version 0.7.0 this library is also compatible with Ember Data's embedded records. Include the embedded attributes in your
serializer like below and benefit from the often superior approach of doing complex object graphs when you don't really have full control over how and when data gets loaded. See the [specific PR](https://github.com/genkgo/ember-localforage-adapter/pull/24) for more information.

```js
// serializers/customer.js
export default LFSerializer.extend(
  DS.EmbeddedRecordsMixin, {
    attrs: {
      addresses: { embedded: 'always' },
      hour: { embedded: 'always' }
    }
  }
);
```

### Semantic versioning

This library follows the rules of semantic versioning. If you see any unexpected API changes, please create an issue to
resolve this. Since Ember Data released its first stable version, this library will follows the major and minor version
numbers that Ember Data is using. So version 1.13.* will be matched by 1.13.0 of the Localforage adapter. If we build in
new features in this adapter, they can only be released together with an update of Ember Data. Of course patches will
always be released as soon as possible.

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

Localforage Adapter License & Copyright
--------------------------------------------------

Copyright (c) 2012 Genkgo BV
MIT Style license. http://opensource.org/licenses/MIT

Original LocalStorage Adapter
Copyright (c) 2012 Ryan Florence
MIT Style license. http://opensource.org/licenses/MIT
