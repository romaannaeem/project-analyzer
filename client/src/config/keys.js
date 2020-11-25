// dev.js - figure out what set of credentials to return
if (process.env.NODE_ENV === 'production') {
  // Heroku sets NODE_ENV variable automatically
  // we are in production, return the prod set of keys
  module.exports = require('./prod');
} else {
  // we are in development, return the dev keys
  module.exports = require('./dev'); // Pull dev set of keys in and pass back to whoever is calling it.
}
