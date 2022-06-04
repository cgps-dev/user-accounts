const jwt = require("jsonwebtoken");

module.exports = function (options) {
  const { secretOrKey, ...opts } = options;
  return function (req, res, next) {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }
    jwt.sign({ sub: req.user._id }, secretOrKey, opts, (err, token) => {
      if (err) return next(err);
      return res.json({ token });
    });
  };
};
