const express = require("express");
const router = express.Router({ strict: true });
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const moment = require("moment");

router.use(cookieParser());

router.use(express.urlencoded({ extended: false }));

router.get("/", checkAuthenticated, (req, res) => {
  const { token } = req.cookies;
  let employeeId;
  jwt.verify(token, "nv", (err, decoded) => {
    if (err) console.log(err);
    employeeId = decoded.id;
  });

  axios
    .post(`http://localhost:3001/employees`, {
      employeeId: employeeId,
    })
    .then((results) => results.data)
    .then((data) => {
      return res.render("admin.ejs", {
        title: "Nhân viên",
        moment: moment,
        employeeId: employeeId,
        data: data,
        socket: true,
        firstLogin: true,
      });
    })
    .catch((err) => console.error(err));
});

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", {
    background: 11,
    title: "Đăng nhập",
    action: "/employee/login",
    register: false,
    path: "employee",
    socket: false,
  });
});

router.post("/login", checkNotAuthenticated, (req, res) => {
  const { username, password } = req.body;

  axios
    .post(`http://localhost:3001/accounts/employee`, {
      username: username,
      password: password,
    })
    .then((response) => {
      return response.data;
    })
    .then((data) => {
      if (data.error) return res.json({ error: true });
      const token = jwt.sign({ id: data.employeeId }, "nv");
      return res
        .status(201)
        .cookie("token", token, {
          expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
        })
        .json({ error: false, url: "/employee" });
    })
    .catch((error) => console.log(error));
});

router.get("/logout", checkAuthenticated, (req, res) => {
  return res
    .status(201)
    .cookie("token", "", {
      expires: new Date("Thu, 01 Jan 1970 00:00:00 UTC"),
      path: "/",
    })
    .redirect("/employee/login");
});

function checkAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "nv", (err, decoded) => {
      if (err) {
        res.redirect("/employee/login");
      } else {
        next();
      }
    });
  } else {
    return res.redirect("/employee/login");
  }
}

function checkNotAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "nv", (err, decoded) => {
      if (err) {
        next();
      } else {
        res.redirect("/employee");
      }
    });
  } else {
    return next();
  }
}

module.exports = router;
