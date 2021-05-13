const port = 3001;
const express = require("express");
const mssql = require("mssql");
const config = require("./sqlConfig");
const app = express();
const cors = require("cors");
const shortid = require("shortid");
const md5 = require("md5");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const { default: axios } = require("axios");
const nodemailer = require("nodemailer");

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sendRecoveryCode = async (email, recoveryCode) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    // service: "gmail",
    auth: {
      user: "luutienphat10@gmail.com", // generated ethereal user
      pass: "phat2000", // generated ethereal password
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  await transporter.sendMail({
    from: "luutienphat10@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Khôi phục tài khoản Book-A-Bike ✔", // Subject line
    text: "Mã khôi phục của bạn là: ", // plain text body
    html: `Mã khôi phục của bạn là: <b>${recoveryCode}</b>`, // html body
  });
};
app.post("/customer/login", () => {});

app.get("/drivers/histories", (req, res) => {
  const { driverId, date } = req.query;

  console.log(date, driverId);
  const sql = `SELECT * FROM LS_DATXE WHERE MATX = N'${driverId}' AND NGAYDATXE = '${date}'`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      console.log(result.recordset[0]);
      res.json(result.recordset);
    })
    .catch((err) => console.error(err));
});

app.get("/list", (req, res) => {
  const sql = `SELECT * FROM DANHSACHCHO`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        res.json(data.recordset);
      }
    });
  });
}); //show các chuyến xe

app.get("/list/:driveId", (req, res) => {
  const { driveId } = req.params;
  const sql = `SELECT * FROM DANHSACHCHO WHERE MACHUYEN = '${driveId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        // console.log(data.recordset[0]);
        res.json(data.recordset[0]);
      }
    });
  });
}); // tìm kiếm chuyến xe theo mã chuyến

app.post("/list", (req, res) => {
  const {
    customerId,
    origin,
    destination,
    distance,
    discount,
    money,
  } = req.body;
  const driveId = shortid.generate();

  const sql = `INSERT INTO DANHSACHCHO(MACHUYEN, MAKH, MATX, NGAYDATXE, GIODATXE, DIEMDON, DIEMDEN, QUANGDUONG, TIENCHIETKHAU, TIEN) VALUES ('${driveId}', '${customerId}', NULL, CONVERT(date, GETDATE()), CONVERT(time, GETDATE()) ,N'${origin}',N'${destination}', '${distance}','${discount}', '${money}' )`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        console.log("Succesfully added");
        return res.json(driveId);
      }
    });
  });
}); //thêm chuyến xe vào bảng tạm

app.delete("/list/:driveId", (req, res) => {
  const { driveId } = req.params;
  const sql = `DELETE FROM DANHSACHCHO WHERE MACHUYEN = '${driveId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        console.log("Succesfully deleted");
      }
    });
  });
}); //xoá chuyến xe khỏi bảng tạm

app.delete("/list/customer/:customerId", (req, res) => {
  const { customerId } = req.params;
  const sql = `DELETE FROM DANHSACHCHO WHERE MAKH = '${customerId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        console.log("Succesfully deleted");
      }
    });
  });
});

app.post("/drives", (req, res) => {
  console.log(req.body);
  const {
    MACHUYEN,
    MAKH,
    MATX,
    NGAYDATXE,
    GIODATXE,
    DIEMDON,
    DIEMDEN,
    QUANGDUONG,
    TIENCHIETKHAU,
    TIEN,
  } = req.body;

  console.log(NGAYDATXE, GIODATXE);
  const sql = `INSERT INTO LS_DATXE(MACHUYEN, MAKH, MATX, NGAYDATXE, GIODATXE, DIEMDON, DIEMDEN, QUANGDUONG, TIENCHIETKHAU, TIEN) 
  VALUES('${MACHUYEN}', '${MAKH}', '${MATX}', '${NGAYDATXE}', '${GIODATXE}', N'${DIEMDON}', N'${DIEMDEN}', '${QUANGDUONG}', '${TIENCHIETKHAU}', '${TIEN}') `;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then(() => {
      res.send(200);
      console.log("sucessfully added drive " + MACHUYEN);
    })
    .catch((err) => console.error(err));
});

app.get("/history/:customerId", (req, res) => {
  const { customerId } = req.params;
  const sql = `SELECT * FROM LICHSUDATXE WHERE MAKH = '${customerId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        res.json(data.recordset);
      }
    });
  });
});

app.get("/drivers/:driverId", (req, res) => {
  const { driverId } = req.params;
  console.log(driverId);
  const sql = `SELECT TAIXE.*, XE.HANGXE, XE.TENXE, XE.BIENKIEMSOAT, XE.MAUSAC FROM TAIXE JOIN XE ON TAIXE.MATX = XE.MATX WHERE TAIXE.MATX = '${driverId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        res.json(data.recordset[0]);
        // if (data.recordset.length === 0) {
        //   // res.sendStatus(404).json("Not Found");
        // } else {
        //   res.json(data.recordset[0]);
        // }
      }
    });
  });
});

app.post("/customers/accounts/check", (req, res) => {
  const { username, password } = req.body;
  const newPassword = password == undefined ? "" : md5(password);

  const SELECT_CUSTOMER_BY_USERNAME = `SELECT * FROM TK_KHACHHANG WHERE TENDANGNHAP = '${username}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(SELECT_CUSTOMER_BY_USERNAME, (err, data) => {
      if (err) console.log(err);
      else {
        const receivedData = data.recordset[0];
        if (receivedData) {
          return res.status(200).json({
            username: receivedData.TENDANGNHAP == username ? true : false,
            password: receivedData.MATKHAU == newPassword ? true : false,
          });
        } else {
          return res.status(200).json({
            username: false,
            password: false,
          });
        }
      }
    });
  });
});

app.put("/customers/accounts/:username", (req, res) => {
  const currentUsername = req.params.username;
  const { username, password } = req.body;
  const newPassword = password == undefined ? "" : md5(password);
  let sql;

  if (password) {
    sql = `UPDATE TK_KHACHHANG SET TENDANGNHAP = N'${username}', MATKHAU = N'${newPassword}' WHERE TENDANGNHAP = N'${currentUsername}'`;
  } else {
    sql = `UPDATE TK_KHACHHANG SET TENDANGNHAP = N'${username}' WHERE TENDANGNHAP = N'${currentUsername}'`;
  }

  console.log(sql);
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else res.sendStatus(200);
    });
  });
});

app.post("/forgot-password/check", (req, res) => {
  const { email = "", username = "", recoveryCode = "" } = req.body;
  console.log(email, username, recoveryCode);

  const CHECK_WITH_CODE = `SELECT * FROM KHACHHANG JOIN TK_KHACHHANG ON KHACHHANG.MAKH = TK_KHACHHANG.MAKH 
  WHERE EMAIL = N'${email}' AND TENDANGNHAP = N'${username}' AND MAKP = '${recoveryCode}'`;

  const CHECK_NO_CODE = `SELECT * FROM KHACHHANG JOIN TK_KHACHHANG ON KHACHHANG.MAKH = TK_KHACHHANG.MAKH 
  WHERE EMAIL = N'${email}' AND TENDANGNHAP = N'${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(recoveryCode == "" ? CHECK_NO_CODE : CHECK_WITH_CODE);
    })
    .then((result) => {
      if (result.recordset.length == 0) {
        res.json({ email: false, username: false, recoveryCode: false });
      } else {
        const data = result.recordset[0];
        return res.json({
          email: email == data.EMAIL,
          username: username == data.TENDANGNHAP,
          recoveryCode: recoveryCode == "" ? false : recoveryCode == data.MAKP,
        });
      }
    })
    .catch((err) => console.error(err));
});

app.post("/forgot-password/send", async (req, res) => {
  const recoveryCode = shortid.generate();
  const { email, username } = req.body;
  const sql = `UPDATE TK_KHACHHANG SET MAKP = '${recoveryCode}' WHERE TENDANGNHAP = N'${username}'`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then(() => {
      sendRecoveryCode(email, recoveryCode);
    })
    .catch((err) => console.error(err));
});

function checkAuthenticated(req, res, next) {
  const { customerToken } = req.cookies;
  if (customerToken) next();
  else return res.redirect("/customer/login");
}

function checkNotAuthenticated(req, res, next) {
  const { customerToken } = req.cookies;
  if (!customerToken) next();
  else return res.redirect("/customer");
}

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
