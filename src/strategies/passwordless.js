const path = require("path");
const fs = require("fs");
const PasswordlessStrategy = require("passport-passwordless");

module.exports = function (
  app,
  passport,
  options,
  { mongoStore, smtp, from, subject, text, html }
) {
  app.post(
    `${options.authPath}/passwordless`,
    options.setRedirectTo,
    passport.authenticate("passwordless"),
    (req, res) => res.json({ sent: true })
  );

  app.get(
    `${options.authPath}/passwordless/callback`,
    options.authenticateCallback("passwordless")
  );

  passport.use(
    new PasswordlessStrategy(
      {
        allowTokenReuse: true,
        tokenLifeTime: 1000 * 60 * 10,
        store: {
          path: "passwordless-mongostore",
          config: mongoStore,
        },
        delivery: {
          type: "emailjs",
          allowGet: true,
          path: "emailjs",
          config: {
            server: smtp,
            msg: {
              from,
              subject,
              text,
              html: html ? fs.readFileSync(path.resolve(html), "utf8") : null,
            },
          },
        },
      },
      (req, profile, done) => {
        const user = {
          type: "passwordless",
          id: profile,
          email: profile,
          name: profile,
          photo: null,
          raw: null,
        };
        options.saveUserProfile(user, done);
      }
    )
  );
};
