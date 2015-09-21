Upgrade Guides
==============

Ember Data 2.0 - Ember Data 2.1
--------------------------------

If the relationship was...|And the associated records were...|The relationship now must be...|What about my association getters?
---|---|---|---
`{ async: false}` *or not specified*|embedded|`{ async: false }` **explicitely**|No change
`{ async: false}` *or not specified*|not embedded|`{ async: true }` *or not specified*|Use **promise** instead of a direct read (see example below)
`{ async: true}`|not embedded|No change|no change
`{ async: true}`|embedded|*irrelevant*|*irrelevant*

Migration example for affected getters:

```javascript
var record = model.get('association')
record.get('whatever');
record.doSomething();
```
Becomes:

```javascript
model.get('association').then(function(record) {
  record.get('whatever');
  record.doSomething();
})
```