const express = require("express");
const router = express.Router({ strict: true });
const mssql = require("mssql");
const config = require("../sqlConfig");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const md5 = require("md5");
const fetch = require("node-fetch");

router.use(cookieParser());

router.get("/", checkAuthenticated, (req, res) => {
  const { token } = req.cookies;
  let driverCode;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    driverCode = decoded.id;
  });

  let data;
  const SELECT_CUSTOMER = `SELECT * FROM TAIXE WHERE MATX = N'${driverCode}'`;
  // const SELECT_INCOME_TODAY = `SELECT * FROM LS_DATXE WHERE MATX = N'${driverCode}' AND THOIGIAN = '2021-04-05'`;

  const poolPromise = mssql.connect(config);

  poolPromise
    .then(() => {
      return mssql.query(SELECT_CUSTOMER);
    })
    // .then((result) => {
    //   data = result.recordset[0];
    // })
    // .then(() => {
    //   return mssql.query(SELECT_INCOME_TODAY);
    // })
    .then((result) => {
      // data = { ...data, ...result.recordset[0] };
      res.render("driver.ejs", {
        data: result.recordset[0],
        title: "Tài xế",
      });
    })
    .catch((err) => console.error(err));
});

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", {
    title: "Đăng nhập",
    action: "/driver/login",
    register: false,
  });
});

router.post("/login", checkNotAuthenticated, (req, res) => {
  const { username, password } = req.body;
  const SELECT_CUSTOMER = `SELECT * FROM TK_TAIXE WHERE TENDANGNHAP = N'${username}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(SELECT_CUSTOMER, (err, data) => {
      if (err) console.log(err);

      const receivedData = data.recordset[0];
      console.log(receivedData);
      if (receivedData == null) {
        res.json({ error: true });
      } else {
        if (receivedData.MATKHAU == md5(password)) {
          const token = jwt.sign({ id: receivedData.MATX }, "tx");
          res
            .status(201)
            .cookie("token", token, {
              expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
            })
            .json({ error: false, url: "/driver" });
        } else {
          res.json({ error: true });
        }
      }
    });
  });
});

router.get("/drive/:driveId", (req, res) => {
  const { driveId } = req.params;
  const { token } = req.cookies;
  let driverCode;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    driverCode = decoded.id;
  });

  let driverData;
  const SELECT_CUSTOMER = `SELECT * FROM TAIXE WHERE MATX = N'${driverCode}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(SELECT_CUSTOMER);
    })
    .then((result) => {
      driverData = result.recordset[0];
    })
    .then(() => {
      fetch(`http://localhost:3001/list/${driveId}`)
        .then((res) => res.json())
        .then((data) => {
          res.render("drive.ejs", {
            data: driverData,
            driveId: driveId,
            origin: data.DIEMDON,
            destination: data.DIEMDEN,
            distance: data.QUANGDUONG,
            money: data.TIEN,
          });
        });
    });
});

router.get("/logout", checkAuthenticated, (req, res) => {
  return res
    .status(201)
    .cookie("token", "", {
      expires: new Date("Thu, 01 Jan 1970 00:00:00 UTC"),
      path: "/",
    })
    .redirect("/driver/login");
});

router.get("/history", checkAuthenticated, (req, res) => {
  const { token } = req.cookies;
  let driverCode;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    driverCode = decoded.id;
  });

  const SELECT_CUSTOMER = `SELECT * FROM TAIXE WHERE MATX = N'${driverCode}'`;

  const poolPromise = mssql.connect(config);

  poolPromise
    .then(() => {
      return mssql.query(SELECT_CUSTOMER);
    })
    .then((result) => {
      res.render("driverHistory.ejs", {
        data: result.recordset[0],
        title: "Lịch sử",
      });
    })
    .catch((err) => console.error(err));
});

router.get("/profile", checkAuthenticated, (req, res) => {
  let id;
  const { token } = req.cookies;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    else id = decoded.id;
  });

  const sql = `SELECT * FROM TAIXE JOIN XE ON TAIXE.MATX = TAIXE.MATX WHERE XE.MATX = N'${id}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      res.render("driverProfile.ejs", {
        data: data.recordset[0],
        title: "Thông tin tài xế",
      });

      mssql.close();
    });
  });
});

router.get("/wallet", checkAuthenticated, (req, res) => {
  const { token } = req.cookies;
  let driverCode;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    driverCode = decoded.id;
  });

  const SELECT_CUSTOMER = `SELECT * FROM TAIXE WHERE MATX = N'${driverCode}'`;

  const poolPromise = mssql.connect(config);

  poolPromise
    .then(() => {
      return mssql.query(SELECT_CUSTOMER);
    })
    .then((result) => {
      res.render("wallet.ejs", {
        data: result.recordset[0],
        title: "Ví tiền",
      });
    })
    .catch((err) => console.error(err));
});

function checkAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "tx", (err, decoded) => {
      if (err) {
        res.redirect("/driver/login");
      } else {
        next();
      }
    });
  } else {
    return res.redirect("/driver/login");
  }
}

function checkNotAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "tx", (err, decoded) => {
      if (err) {
        next();
      } else {
        res.redirect("/driver");
      }
    });
  } else {
    return next();
  }
}

module.exports = router;
