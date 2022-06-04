const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports = function (app, passport, options) {
  const config = {

    algorithm: "HS256",
    expiresIn: "24 hours",
    secretOrKey: null,
    issuer: null,
    audience: null,
    ...options.tokens,
  };

  if (!config.secretOrKey || !config.issuer) {
    throw new Error("Required token config missing");
  }

  app.get(`${options.authPath}/token`, require("./issue")(config));

  const strategyConfig = {
    ...config,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  const authenticate = passport.authenticate("jwt", { session: false });
  app.use((req, res, next) => {
    const token = strategyConfig.jwtFromRequest(req);
    if (!token) {
      next();
    } else {
      authenticate(req, res, next);
    }
  });

  passport.use(
    new JwtStrategy(strategyConfig, (jwtPayload, done) => {
      options.userStore.deserialize(jwtPayload.sub, done);
    })
  );
};
