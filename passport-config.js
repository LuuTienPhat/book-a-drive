const LocalStrategy = require("passport-local").Strategy;

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = (email, password, done) => {
    const user = getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: "No user with that Email" });
    }

    if (password == user.password) {
      return done(null, user);
    } else {
      return done(null, false, { message: "password incorrect" });
    }
  };
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

module.exports = initialize;
