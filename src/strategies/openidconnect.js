const OpenIDConnectStrategy = require("passport-openidconnect");

const boolean = function (value) {
  switch (Object.prototype.toString.call(value)) {
    case '[object String]':
      return [ 'true', 't', 'yes', 'y', 'on', '1' ].includes(value.trim().toLowerCase());

    case '[object Number]':
      return value.valueOf() === 1;

    case '[object Boolean]':
      return value.valueOf();

    default:
      return false;
  }
};

module.exports = function (app, passport, options) {
  const config = {
    // issuer: "https://server.example.com",
    // authorizationURL: "https://server.example.com/authorize",
    // tokenURL: "https://server.example.com/token",
    // userInfoURL: "https://server.example.com/userinfo",
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${options.authUrl}/openidconnect/callback`,
    ...options.strategies.openidconnect,
  };

  app.get(
    `${options.authPath}/openidconnect`,
    options.setRedirectTo,
    passport.authenticate("openidconnect"),
  );

  app.get(
    `${options.authPath}/openidconnect/callback`,
    options.authenticateCallback("openidconnect"),
  );

  app.get(
    `/api/auth/callback/openidconnect`,
    options.authenticateCallback("openidconnect"),
  );

  passport.use(
    new OpenIDConnectStrategy(
      config,
      (profile, uiProfile, done) => {
        if (Array.isArray(options.strategies.openidconnect.checks)) {
          const ckecks = options.strategies.openidconnect.checks;
          const pass = ckecks.every((x) => boolean(profile[x]));
          if (!pass) {
            throw new Error("Access Denied");
          }
        }
        
        const user = {
          type: "openidconnect",
          id: profile[config.idAttribute || "id"],
          email: profile[config.emailAttribute || "email"],
          name: profile[config.nameAttribute || "name"],
          raw: profile,
        };
        options.saveUserProfile(user, done);
      },
    )
  );
};
