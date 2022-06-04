const Strategy = require("passport-ldapauth").Strategy;
const path = require("path");
const fs = require("fs");

module.exports = function (app, passport, options) {
  const config = {
    loginTemplate: path.join(__dirname, "..", "templates", "login.html"),
    session: false,
    usernameField: "username",
    passwordField: "password",
    url: "ldap://localhost:389",
    bindDn: "cn=root",
    bindCredentials: "secret",
    searchBase: "ou=passport-ldapauth",
    searchFilter: "(uid={{username}})",
    searchAttributes: undefined,
    ...options.strategies.ldap,
  };

  if (options.strategies.ldap.cretPath) {
    if (!config.tlsOptions) {
      config.tlsOptions = {};
    }
    config.tlsOptions.cret = [ fs.readFileSync(options.strategies.ldap.cretPath) ];
  }

  if (options.strategies.ldap.caPath) {
    if (!config.tlsOptions) {
      config.tlsOptions = {};
    }
    config.tlsOptions.ca = [ fs.readFileSync(options.strategies.ldap.caPath) ];
  }

  if (options.strategies.ldap.rejectUnauthorized === false) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  app.get(`${options.authPath}/ldap`, (req, res) => {
    res.sendFile(config.loginTemplate);
  });

  app.post(`${options.authPath}/ldap`, (req, res, next) => {
    passport.authenticate("ldapauth", { session: config.session }, (authenticateErr, user, info) => {
      if (authenticateErr) {
        next(authenticateErr);
        return;
      }
      if (!user) {
        res.status(401).send(info);
        return;
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          next(loginErr);
          return;
        }
        res.redirect(options.successRedirect);
      });
    })(req, res, next);
  });

  passport.use(
    new Strategy(
      {
        usernameField: config.usernameField,
        passwordField: config.passwordField,
        server: {
          url: config.url,
          bindDn: config.bindDn,
          bindCredentials: config.bindCredentials,
          searchBase: config.searchBase,
          searchFilter: config.searchFilter,
          searchAttributes: config.searchAttributes,
          tlsOptions: config.tlsOptions,
          timeLimit: config.timeLimit,
          timeout: config.timeout,
          connectTimeout: config.connectTimeout,
          idleTimeout: config.idleTimeout,
          queueTimeout: config.queueTimeout,
          ...config,
        },
        passReqToCallback: true,
      },
      (req, profile, done) => {
        const user = {
          type: "ldap",
          id: profile[config.idAttribute || "uid"],
          token: null,
          email: profile[config.emailAttribute || "mail"],
          name: profile[config.nameAttribute || "displayName"],
          photo: null,
          raw: profile,
        };
        options.saveUserProfile(user, done);
      }
    )
  );
};
