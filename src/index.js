const passport = require("passport");

// require("./useRequestClient");

module.exports = function (app, userOptions) {
  const options = {
    saveUserProfile(user, done) {
      process.nextTick(() => options.userStore.save(user, done));
    },
    setRedirectTo(req, res, next) {
      if (options.redirectToReferrer) {
        req.session.redirectTo = req.header.referrer || req.headers.referer;
      }
      next();
    },
    authenticateCallback(strategyName) {
      return function (req, res, next) {
        passport.authenticate(strategyName, (err, user) => {
          if (err) {
            console.error(err);
            return res.redirect(
              `${options.failureRedirect}?message=${encodeURIComponent(err)}`
            );
          }

          if (!user) {
            return res.redirect(options.failureRedirect);
          }

          if (options.allowedUsers && !options.allowedUsers.includes(user.email)) {
            return res.redirect(options.failureRedirect);
          }

          return req.logIn(user, (loginError) => {
            if (loginError) {
              return next(loginError);
            }

            return options.onLogin(req, res, next).then(() => {
              if (options.redirectToReferrer) {
                res.redirect(
                  req.session.redirectTo || options.successRedirect
                );
              } else {
                res.redirect(options.successRedirect);
              }
            });
          });
        })(req, res, next);
      };
    },
    authUrl: `${userOptions.url}${userOptions.authPath}`,
    logoutRedirect: "/",
    strategies: {},
    redirectToReferrer: true,
    onLogin: () => Promise.resolve(),
    onLogout: () => Promise.resolve(),
    ...userOptions,
  };

  app.use(passport.initialize());

  app.use(passport.session());

  passport.serializeUser(options.userStore.serialize);
  passport.deserializeUser(options.userStore.deserialize);

  const strategies = Object.keys(options.strategies);
  strategies.forEach((strategy) => {
    require(`./strategies/${strategy}`)(
      app,
      passport,
      options,
      options.strategies[strategy]
    );
  });

  if (options.tokens) {
    require("./tokens")(app, passport, options);
  }

  if (options.logoutPath) {
    app.get(options.logoutPath, (req, res, next) => {
      options
        .onLogout(req, res, next)
        .then(() => {
          req.logout();
          const redirectTo = options.redirectToReferrer
            ? req.header.referrer || req.headers.referer
            : null;
          res.redirect(redirectTo || options.logoutRedirect);
        })
        .catch(next);
    });
  }
};
