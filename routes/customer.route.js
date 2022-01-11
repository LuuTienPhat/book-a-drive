const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const controller = require("../controllers/customer.controller");
const session = require("express-session");

router.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "somesecret",
  })
);

function checkAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "kh", (err, decoded) => {
      if (err) {
        return res.redirect("/customer/login");
      } else {
        return next();
      }
    });
  } else {
    return res.redirect("/customer/login");
  }
}

function checkNotAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "kh", (err, decoded) => {
      if (err) {
        next();
      } else {
        res.redirect("/customer");
      }
    });
  } else {
    return next();
  }
}

router.get("/", checkAuthenticated, controller.renderCustomerPage);

router.get("/search", checkAuthenticated, controller.renderSearchPage);

router.get("/login", checkNotAuthenticated, controller.renderLoginPage);

router.post("/login", checkNotAuthenticated, controller.postLoginPage);

router.get("/register", checkNotAuthenticated, controller.renderRegisterPage);

router.get(
  "/forgot-password",
  checkNotAuthenticated,
  controller.renderForgotPasswordPage
);

router.get("/profile", checkAuthenticated, controller.renderProfilePage);

router.put("/profile", checkAuthenticated, controller.putProfilePage);

router.get("/logout", checkAuthenticated, controller.logOut);

router.get("/history", checkAuthenticated, controller.renderHistoryPage);

module.exports = router;
