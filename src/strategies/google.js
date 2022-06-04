const Strategy = require("passport-google-oauth20").Strategy;

module.exports = function (app, passport, options) {
  app.get(
    `${options.authPath}/google`,
    options.setRedirectTo,
    passport.authenticate("google", {
      scope: [ "profile", "email" ],
    })
  );

  app.get(`${options.authPath}/google/callback`,
    options.authenticateCallback("google")
  );

  passport.use(new Strategy({
    clientID: options.strategies.google.clientID,
    clientSecret: options.strategies.google.clientSecret,
    callbackURL: `${options.authUrl}/google/callback`,
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      type: "google",
      id: profile.id,
      token: accessToken,
      email: profile.emails && profile.emails.length && profile.emails[0].value ? profile.emails[0].value : null,
      name: profile.displayName,
      photo: profile.photos && profile.photos.length && profile.photos[0].value ? profile.photos[0].value : null,
      raw: profile,
    };
    options.saveUserProfile(user, done);
  }));
};
