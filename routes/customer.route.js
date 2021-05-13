const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const {
  renderCustomerPage,
  renderLoginPage,
  renderRegisterPage,
  postRegisterPage,
  postLoginPage,
  logOut,
  renderSearchPage,
  renderProfilePage,
  putProfilePage,
  renderForgotPasswordPage,
} = require("../controllers/customer.controller");

router.use(cookieParser());

router.use(express.urlencoded({ extended: false }));

router.get("/", checkAuthenticated, renderCustomerPage);

router.get("/search", checkAuthenticated, renderSearchPage);

router.get("/login", checkNotAuthenticated, renderLoginPage);

router.post("/login", checkNotAuthenticated, postLoginPage);

router.get("/register", checkNotAuthenticated, renderRegisterPage);

router.post("/register", checkNotAuthenticated, postRegisterPage);

router.get("/forgot-password", checkNotAuthenticated, renderForgotPasswordPage);

router.get("/profile", checkAuthenticated, renderProfilePage);

router.put("/profile", checkAuthenticated, putProfilePage);

router.get("/logout", checkAuthenticated, logOut);

function checkAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "kh", (err, decoded) => {
      if (err) {
        res.redirect("/customer/login");
      } else {
        next();
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

module.exports = router;
