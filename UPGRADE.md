Upgrade Guides
==============

Ember Data 2.0
--------------------------------

Changes required by migration from ED < 2.0 to ED >= 2.0:

If the relationship was...|The relationship now must be...
---|---
`{async: false}`|no change
`{async: true}`|no change *or specification could be removed*
*not specified*|`{async: false}` **explicitely**

Then the following changes are required by migration from ELA 2.0 to ELA 2.1:

If the relationship was...|And the associated records were...|The relationship now must be...|What about the association getters?
---|---|---|---
`{async: false}`|embedded|no change|no change
`{async: false}`|not embedded|`{async: true}`<br/>*or not specified*|Use **promise** instead of<br/> direct read<br/>(see example below)
`{async: true}`<br/>*or not specified*|not embedded|no change|no change
`{async: true}`<br/>*or not specified*|embedded|*irrelevant*|*irrelevant*

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
