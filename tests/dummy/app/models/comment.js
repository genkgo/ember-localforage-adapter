import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  post: DS.belongsTo('post', { async: true }),
  author: DS.belongsTo('author', { async: true })
});