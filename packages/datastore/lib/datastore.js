module.exports = require('@google-cloud/datastore')({
  projectId: 'carsnag-gae',
  credentials: require('./carsnag.json')
});
