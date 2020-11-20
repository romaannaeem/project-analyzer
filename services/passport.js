const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios');
const User = require('../models/User.js');
const { baseServerURL } = require('../config/keys');

passport.serializeUser((user, done) => {
  done(null, user.clickupId);
});

passport.deserializeUser((clickupId, done) => {
  User.findOne({
    clickupId: clickupId,
  }).then((user) => done(null, user));
});

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: 'https://app.clickup.com/api',
      tokenURL: 'https://app.clickup.com/api/v2/oauth/token',
      clientID: process.env.CLICKUP_CLIENT_ID,
      clientSecret: process.env.CLICKUP_SECRET,
      callbackURL: `${baseServerURL}/api/auth/clickup/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      axios
        .get('https://app.clickup.com/api/v2/user', {
          headers: { Authorization: accessToken },
        })
        .then(async (response) => {
          const { id, username, email } = response.data.user;

          let existingUser = await User.findOne({
            clickupId: id,
          });

          if (existingUser) {
            return done(null, existingUser);
          } else {
            const user = await new User({
              clickupId: id,
              name: username,
              email: email,
              token: accessToken,
            }).save();
            done(null, user);
          }
        })
        .catch((err) => {
          done(err, null);
        });
    }
  )
);
