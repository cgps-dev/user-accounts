const TwitterStrategy = require("passport-twitter").Strategy;

module.exports = function (app, passport, options) {
  app.get(
    `${options.authPath}/twitter`,
    options.setRedirectTo,
    passport.authenticate("twitter")
  );

  app.get(`${options.authPath}/twitter/callback`,
    options.authenticateCallback("twitter")
  );

  passport.use(new TwitterStrategy({
    consumerKey: options.strategies.twitter.consumerKey,
    consumerSecret: options.strategies.twitter.consumerSecret,
    callbackURL: `${options.authUrl}/twitter/callback`,
    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
    includeEmail: true,
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      type: "twitter",
      id: profile.id,
      token: accessToken,
      email: profile.emails && profile.emails.length && profile.emails[0].value
        ? profile.emails[0].value : null,
      name: profile.displayName,
      photo: profile.photos && profile.photos.length && profile.photos[0].value
        ? profile.photos[0].value : null,
      raw: profile,
    };
    options.saveUserProfile(user, done);
  }));
};
