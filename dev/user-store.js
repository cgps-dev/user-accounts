const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  profile: Object,
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  serialize(user, done) {
    done(null, user.id);
  },
  deserialize(id, done) {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  },
  async save(profile, done) {
    try {
      const user = await User.findOne({
        "profile.type": profile.type,
        "profile.id": profile.id,
      });

      if (user) {
        // if the user is found, then log them in
        return done(null, user);
      }
      // if there is no user found with that facebook id, create them
      const newUser = new User({ profile });

      // save our user to the database
      await newUser.save();
      done(null, newUser);
    } catch (e) {
      done(e);
    }
  },
};
