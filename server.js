const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const initializePassport = require("./passport-config");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const userRoute = require("./routes/user.route");
const engine = require("ejs-mate");
var expressLayouts = require("express-ejs-layouts");

let users = [
  {
    id: "1615631885703",
    name: "Guest",
    email: "guest@gmail.com",
    password: "123456",
  },
];

let panel = {
  optionPanel: false,
  historyPanel: true,
};

const getUserByEmail = (email) => users.find((user) => user.email === email);
const getUserById = (id) => users.find((user) => user.id === id);

initializePassport(passport, getUserByEmail, getUserById);

app.engine("ejs", engine);
app.set("views", "./views");
app.set("view-engine", "ejs");

// app.use(expressLayouts);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

app.use(flash());
app.use(
  session({
    secret: "Phat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  const { origin, destination } = req.query;
  res.render("index.ejs", {
    origin: origin,
    destination: destination,
  });
});

// app.post("/directions", (req, res) => {
//   const { origin, dest } = req.body;
//   console.log(origin, dest);
//   return res.render("index.ejs", {
//     origin: origin,
//     destination: dest,
//   });
// });

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, (req, res) => {
  const { name, email, password } = req.body;
  users.push({
    id: Date.now().toString(),
    name: name,
    email: email,
    password: password,
  });
  console.log(users);
  res.redirect("/");
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.use("/users", userRoute);

app.get("/search", (req, res) => {
  res.render("search.ejs");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
