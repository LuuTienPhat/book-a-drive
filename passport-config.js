const LocalStrategy = require("passport-local").Strategy;
const mssql = require("mssql");
const config = require("./sqlConfig");

async function getCustomer(email) {}

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const SELECT_KHACHHANG_CONDITION = `SELECT * FROM KHACHHANG WHERE EMAIL = '${email}'`;

    mssql.connect(config, (err) => {
      if (err) console.log(err);
      let mssqlRequest = new mssql.Request();

      mssqlRequest.query(SELECT_KHACHHANG_CONDITION, (err, data) => {
        if (err) console.log(err);
        // console.log(data.recordset);
        const user = data.recordset[0];
        console.log(user);
        if (user == null) {
          return done(null, false, { message: "No user with that Email" });
        }

        if (password == user.MATKHAU) {
          return done(null, data);
        } else {
          return done(null, false, { message: "password incorrect" });
        }
      });
    });
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  passport.serializeUser((user, done) => {
    return done(null, user.MAKH);
  });

  passport.deserializeUser((id, done) => {
    return done(null, user.MAKH);
  });
}

module.exports = initialize;
