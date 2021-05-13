const express = require("express");
const mssql = require("mssql");
const router = express.Router();

var config = {
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

router.get("/", (req, res) => {
  const SELECT_ALL_KHACHHANG = "SELECT * FROM KHACHHANG WHERE MAKH = 'kh1'";

  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(SELECT_ALL_KHACHHANG, (err, data) => {
      if (err) console.log(err);

      res.render("profile.ejs", data.recordset[0]);
      mssql.close();
    });
  });
});

router.post("/", (req, res) => {
  const { firstname, lastname, phone, birthday, email, password } = req.body;
  // console.log(firstname, lastname);
  const UPDATE_KHACHHANG = `UPDATE KHACHHANG SET TENKH = N'${firstname}', HOKH = N'${lastname}' WHERE MAKH = 'kh1'`;

  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(UPDATE_KHACHHANG, (err) => {
      if (err) console.log(err);
    });
  });
});

module.exports = router;
