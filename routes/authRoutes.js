const securityLevel = require('../middlewares/securityLevel');
const passport = require('passport');
const { baseClientURL } = require('../config/keys');

module.exports = (app) => {
  app.get('/api/auth/clickup', passport.authenticate('oauth2'));

  app.get(
    '/api/auth/clickup/callback',
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect(baseClientURL);
    }
  );

  app.get('/api/auth/user', securityLevel(0), (req, res) => {
    res.send(req.user);
  });

  app.get('/api/auth/logout', securityLevel(0), (req, res) => {
    req.logout();
    res.redirect('/');
  });
};
