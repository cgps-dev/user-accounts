const FacebookStrategy = require("passport-facebook").Strategy;

module.exports = function (app, passport, options) {
  app.get(
    `${options.authPath}/facebook`,
    options.setRedirectTo,
    passport.authenticate("facebook", {
      scope: [ "public_profile", "email" ],
    })
  );

  app.get(`${options.authPath}/facebook/callback`,
    options.authenticateCallback("facebook")
  );

  passport.use(new FacebookStrategy({
    clientID: options.strategies.facebook.clientID,
    clientSecret: options.strategies.facebook.clientSecret,
    callbackURL: `${options.authUrl}/facebook/callback`,
    profileFields: [ "id", "displayName", "photos", "email" ],
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      type: "facebook",
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
