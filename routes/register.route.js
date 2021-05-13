const express = require("express");
const mssql = require("mssql");
const router = express.Router();
const shortid = require("shortid");

const config = {
  user: "sa",
  password: "123",
  server: "localhost",
  database: "TEST",
  port: 1433,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

router.get("/", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs", {
    title: "Đăng ký",
  });
});

router.post("/", checkNotAuthenticated, (req, res) => {
  const customerId = shortid.generate();

  const { firstname, lastname, phone, email, password } = req.body;
  console.log(firstname, lastname, email, phone, password);
  const INSERT_KHACH_HANG = `INSERT INTO KHACHHANG (MAKH, TENKH, HOKH, NGAYSINH, SDT, EMAIL, MATKHAU, LICHSU) VALUES ('${customerId}', N'${firstname}', N'${lastname}', NULL, '${phone}', '${email}', '${password}', NULL)`;

  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(INSERT_KHACH_HANG, (err) => {
      if (err) console.log(err);
    });
  });

  res.redirect("/login");
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

module.exports = router;
