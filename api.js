const port = 3001;
const express = require("express");
const mssql = require("mssql");
const config = require("./sqlConfig");
const app = express();
const cors = require("cors");
const shortid = require("shortid");
const md5 = require("md5");
const cookieParser = require("cookie-parser");
const { default: axios } = require("axios");
const nodemailer = require("nodemailer");
const moment = require("moment");

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
    tls: {
      rejectUnauthorized: false,
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
    subject: "Khôi phục tài khoản Book-A-Drive ✔", // Subject line
    text: "Mã khôi phục của bạn là: ", // plain text body
    html: `Mã khôi phục của bạn là: <b>${recoveryCode}</b>`, // html body
  });
};

//----------------------------------------------

//LẤY LÀI KHOẢN CỦA TÀI XẾ BẰNG driverId trả về TENDANGNHAP
app.post("/accounts/drivers", (req, res, next) => {
  const { driverId } = req.body;
  if (!driverId) return next();

  const sql = `SELECT TENDANGNHAP FROM TK_TAIXE WHERE MATX = '${driverId}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      return result.recordset[0];
    })
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => console.error(err));
});

//LẤY LÀI KHOẢN CỦA TÀI XẾ BẰNG USERNAME và MẬT KHẨU
app.post("/accounts/drivers", (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM TK_TAIXE WHERE TENDANGNHAP = '${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      return result.recordset[0];
    })
    .then((data) => {
      if (data == null) {
        return res.json({ error: true });
      } else {
        if (data.MATKHAU == md5(password)) {
          return res.status(200).json({ driverId: data.MATX });
        } else {
          return res.json({ error: true });
        }
      }
    })
    .catch((err) => console.error(err));
});

//ĐĂNG KÍ TÀI KHOẢN TÀI XẾ MỚI
app.put("/accounts/drivers", (req, res) => {
  const { driverId, username, password } = req.body;
  const newPassword = md5(password);

  const INSERT_DRIVER_ACCOUNT = `INSERT INTO TK_TAIXE VALUES (N'${driverId}', N'${username}', N'${newPassword}', NULL)`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(INSERT_DRIVER_ACCOUNT);
    })
    .then((result) => res.status(200).json({ error: false }))
    .catch((err) => {
      console.error(err);
      res.json({ error: true });
    });
});

//KIỂM TRA TÀI KHOẢN TÀI XẾ
app.post("/accounts/drivers/check", (req, res) => {
  const { driverId, email, identityNumber, username, password, recoveryCode } =
    req.body;
  const newPassword = md5(password || "");

  const SELECT_ACCOUNTS_USERNAME = `SELECT * FROM TAIXE JOIN TK_TAIXE ON TAIXE.MATX = TK_TAIXE.MATX WHERE TENDANGNHAP = '${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(SELECT_ACCOUNTS_USERNAME);
    })
    .then((result) => {
      if (!result.recordset[0]) {
        return res.json({
          email: false,
          identityNumber: false,
          username: false,
          password: false,
          recoveryCode: false,
        });
      } else return result.recordset[0];
    })
    .then((data) => {
      if (driverId == data.MATX[0]) {
        return res.json({
          username: username == data.TENDANGNHAP,
          password: newPassword == data.MATKHAU,
        });
      } else if (!email) {
        return res.json({ username: username == data.TENDANGNHAP });
      } else if (data.CMND != identityNumber) {
        return res.json({
          email: false,
          identityNumber: false,
          username: false,
          password: false,
          recoveryCode: false,
        });
      } else {
        return res.status(200).json({
          email: email == data.EMAIL,
          identityNumber: identityNumber == data.CMND,
          username: username == data.TENDANGNHAP,
          password: newPassword == data.MATKHAU,
          recoveryCode: recoveryCode == data.MAKP,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.json({ error: true });
    });
});

//GỬI MÃ KHÔI PHỤC CHO TÀI XẾ
app.post("/accounts/drivers/send", async (req, res) => {
  const recoveryCode = shortid.generate();
  const { email, username } = req.body;
  const sql = `UPDATE TK_TAIXE SET MAKP = '${recoveryCode}' WHERE TENDANGNHAP = N'${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then(async () => {
      await sendRecoveryCode(email, recoveryCode);
    })
    .catch((err) => console.error(err));
});

//SỬA THÔNG TIN TÀI KHOẢN TÀI XẾ
app.patch("/accounts/drivers/", (req, res) => {
  const { driverId, username, password, recoveryCode } = req.body;
  const newPassword = md5(password ? password : "");

  const poolPromise = mssql.connect(config);
  if (driverId && username) {
    const UPDATE_DRIVER_ACCOUNT = `UPDATE TK_TAIXE SET TENDANGNHAP = N'${username}' WHERE MATX = N'${driverId}'`;
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_DRIVER_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  } else if (driverId && password) {
    const UPDATE_DRIVER_ACCOUNT = `UPDATE TK_TAIXE SET MATKHAU = N'${newPassword}' WHERE MATX = N'${driverId}'`;
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_DRIVER_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  } else if (!driverId && !recoveryCode) {
    return res.json({ error: true });
  } else if (driverId && !recoveryCode) {
    const UPDATE_DRIVER_ACCOUNT = `UPDATE TK_TAIXE SET TENDANGNHAP = N'${username}, MATKHAU = N'${newPassword}' WHERE MATX = N'${driverId}'`;
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_DRIVER_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  } else if (!driverId && recoveryCode) {
    const UPDATE_DRIVER_ACCOUNT = `UPDATE TK_TAIXE SET MATKHAU = N'${newPassword}', MAKP = NULL WHERE MAKP = N'${recoveryCode}'`;
    // console.log(UPDATE_DRIVER_ACCOUNT);
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_DRIVER_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  } else {
    return res.json({ error: true });
  }
});

//----------------------------------------------

//LẤY TÀI KHOẢN CỦA NHÂN VIÊN
app.post("/accounts/employee", (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM TK_NHANVIEN WHERE TENDANGNHAP = '${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      return result.recordset[0];
    })
    .then((data) => {
      if (data == null) {
        return res.json({ error: true });
      } else {
        if (data.MATKHAU == md5(password)) {
          return res.status(200).json({ employeeId: data.MANV });
        } else {
          return res.json({ error: true });
        }
      }
    })
    .catch((err) => console.error(err));
});

//CHỈNH SỬA KHOẢN NHÂN VIÊN MỚI
app.patch("/accounts/employee", (req, res) => {
  const { employeeId, username, password } = req.body;
  const newPassword = md5(password ? password : "");

  const poolPromise = mssql.connect(config);
  if (employeeId && username) {
    const UPDATE_EMPLOYEE_ACCOUNT = `UPDATE TK_NHANVIEN SET TENDANGNHAP = N'${username}' WHERE MANV = N'${employeeId}'`;
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_EMPLOYEE_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  } else if (employeeId && password) {
    const UPDATE_EMPLOYEE_ACCOUNT = `UPDATE TK_NHANVIEN SET MATKHAU = N'${newPassword}' WHERE MANV = N'${employeeId}'`;
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_EMPLOYEE_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  } else {
    return res.json({ error: true });
  }
});

//KIỂM TRA TÀI KHOẢN NHÂN VIÊN
app.post("/accounts/employee/check", (req, res) => {
  const {
    employeeId,
    email,
    identityNumber,
    username,
    password,
    recoveryCode,
  } = req.body;
  const newPassword = md5(password || "");

  const SELECT_ACCOUNTS_USERNAME = `SELECT * FROM NHANVIEN JOIN TK_NHANVIEN ON NHANVIEN.MANV = TK_NHANVIEN.MANV WHERE TK_NHANVIEN.TENDANGNHAP = '${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(SELECT_ACCOUNTS_USERNAME);
    })
    .then((result) => {
      if (!result.recordset[0]) {
        return res.json({
          email: false,
          identityNumber: false,
          username: false,
          password: false,
          recoveryCode: false,
        });
      } else return result.recordset[0];
    })
    .then((data) => {
      if (employeeId == data.MANV[0]) {
        return res.json({
          username: username == data.TENDANGNHAP,
          password: newPassword == data.MATKHAU,
        });
      } else if (!email) {
        return res.json({ username: username == data.TENDANGNHAP });
      } else if (data.CMND != identityNumber) {
        return res.json({
          email: false,
          identityNumber: false,
          username: false,
          password: false,
          recoveryCode: false,
        });
      } else {
        return res.status(200).json({
          email: email == data.EMAIL,
          identityNumber: identityNumber == data.CMND,
          username: username == data.TENDANGNHAP,
          password: newPassword == data.MATKHAU,
          recoveryCode: recoveryCode == data.MAKP,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.json({ error: true });
    });
});

//THÊM TÀI KHOẢN NHÂN VIÊN MỚI
app.put("/accounts/employee", (req, res) => {
  const { employeeId, username, password } = req.body;
  const newPassword = md5(password);

  const sql = `INSERT INTO TK_NHANVIEN VALUES ('${employeeId}', N'${username}',  N'${newPassword}')`;
  console.log(sql);
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => res.json({ error: false, employeeId: employeeId }))
    .catch((err) => console.error(err));
});

//---------------------------------------------

//LẤY LÀI KHOẢN CỦA KHÁCH HÀNG
app.post("/accounts/customers", (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM TK_KHACHHANG WHERE TENDANGNHAP = '${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      return result.recordset[0];
    })
    .then((data) => {
      if (data == null) {
        return res.json({ error: true });
      } else {
        if (data.MATKHAU == md5(password)) {
          return res.status(200).json({ customerId: data.MAKH });
        } else {
          return res.json({ error: true });
        }
      }
    })
    .catch((err) => console.error(err));
});

//TẠO TÀI KHOẢN KHÁCH HÀNG
app.put("/accounts/customers", (req, res) => {
  const { customerId, username, password } = req.body;
  const newPassword = md5(password);

  const INSERT_TAIKHOAN = `INSERT INTO TK_KHACHHANG VALUES ('${customerId}', N'${username}', N'${newPassword}', NULL)`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(INSERT_TAIKHOAN);
    })
    .then(() => res.status(200).json({ url: "/customer" }))
    .catch((err) => {
      console.error(err);
      res.status(404).json({ error: true });
    });
});

//KIỂM TRA TÀI KHOẢN KHÁCH HÀNG
app.post("/accounts/customers/check", (req, res) => {
  const { customerId, email, username, password, recoveryCode } = req.body;
  const newPassword = md5(password || "");

  const SELECT_ACCOUNTS_USERNAME = `SELECT * FROM KHACHHANG JOIN TK_KHACHHANG ON KHACHHANG.MAKH = TK_KHACHHANG.MAKH WHERE TENDANGNHAP = '${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(SELECT_ACCOUNTS_USERNAME);
    })
    .then((result) => {
      if (!result.recordset[0]) {
        return res.json({
          email: false,
          username: false,
          password: false,
          recoveryCode: false,
        });
      } else return result.recordset[0];
    })
    .then((data) => {
      if (customerId == data.MAKH[0]) {
        return res.json({
          username: username == data.TENDANGNHAP,
          password: newPassword == data.MATKHAU,
        });
      } else if (!email) {
        return res.json({ username: username == data.TENDANGNHAP });
      } else if (email != data.EMAIL) {
        return res.status(200).json({
          email: false,
          username: false,
          password: false,
          recoveryCode: false,
        });
      } else {
        return res.status(200).json({
          email: email == data.EMAIL,
          username: username == data.TENDANGNHAP,
          password: newPassword == data.MATKHAU,
          recoveryCode: recoveryCode == data.MAKP,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.json({ error: true });
    });
});

//GỬI MÃ KHÔI PHỤC CHO KHÁCH HÀNG
app.post("/accounts/customers/send", async (req, res) => {
  const recoveryCode = shortid.generate();
  const { email, username } = req.body;
  const sql = `UPDATE TK_KHACHHANG SET MAKP = '${recoveryCode}' WHERE TENDANGNHAP = N'${username}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then(async () => {
      await sendRecoveryCode(email, recoveryCode);
    })
    .catch((err) => console.error(err));
});

//SỬA THÔNG TIN TÀI KHOẢN KHÁCH HÀNG
app.patch("/accounts/customers/", (req, res) => {
  const { customerId, username, password, recoveryCode } = req.body;
  const newPassword = md5(password ? password : "");

  const poolPromise = mssql.connect(config);
  if (customerId && username) {
    const UPDATE_CUSTOMER_ACCOUNT = `UPDATE TK_KHACHHANG SET TENDANGNHAP = N'${username}' WHERE MAKH = N'${customerId}'`;
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_CUSTOMER_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  } else if (customerId && password) {
    const UPDATE_CUSTOMER_ACCOUNT = `UPDATE TK_KHACHHANG SET MATKHAU = N'${newPassword}' WHERE MAKH = N'${customerId}'`;
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_CUSTOMER_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  }
  //
  else if (!customerId && !recoveryCode) {
    return res.json({ error: true });
  } else if (customerId && !recoveryCode) {
    const UPDATE_CUSTOMER_ACCOUNT = `UPDATE TK_KHACHHANG SET TENDANGNHAP = N'${username}, MATKHAU = N'${newPassword}' WHERE MAKH = N'${customerId}'`;
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_CUSTOMER_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  }
  //
  else if (!customerId && recoveryCode) {
    const UPDATE_CUSTOMER_ACCOUNT = `UPDATE TK_KHACHHANG SET MATKHAU = N'${newPassword}', MAKP = NULL WHERE MAKP = N'${recoveryCode}'`;
    // console.log(UPDATE_CUSTOMER_ACCOUNT);
    poolPromise
      .then(() => {
        return mssql.query(UPDATE_CUSTOMER_ACCOUNT);
      })
      .then(() => res.status(200).json({ error: false }))
      .catch((err) => {
        console.error(err);
        return res.json({ error: true });
      });
  } else {
    return res.json({ error: true });
  }
});
//-----------------------------------------------

//-----------------------------------------------
//LẤY KHÁCH HÀNG BẰNG MÃ KHÁCH HÀNG
// app.post("/customers", (req, res, next) => {
//   const { customerId } = req.params;
//   if (!customerId) return next();

//   const sql = `SELECT * FROM KHACHHANG WHERE MAKH = '${customerId}'`;

//   const poolPromise = mssql.connect(config);
//   poolPromise
//     .then(() => {
//       return mssql.query(sql);
//     })
//     .then((result) => {
//       return result.recordset[0];
//     })
//     .then((data) => {
//       if (data == null) return res.json({ error: true });
//       else return res.status(200).json(data);
//     })
//     .catch((err) => console.error(err));
// });

//LẤY THÔNG TIN KHÁCH HÀNG BẰNG MÃ KHÁCH HÀNG
app.post("/customers", (req, res) => {
  const { customerId } = req.body;
  const SELECT_KHACHHANG_AND_TAIKHOAN = `SELECT * FROM KHACHHANG JOIN TK_KHACHHANG ON KHACHHANG.MAKH = TK_KHACHHANG.MAKH WHERE KHACHHANG.MAKH = N'${customerId}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(SELECT_KHACHHANG_AND_TAIKHOAN);
    })
    .then((result) => result.recordset[0])
    .then((data) => res.status(200).json(data))
    .catch((err) => console.error(err));
});

//TẠO KHÁCH HÀNG MỚI
app.put("/customers", (req, res) => {
  const customerId = shortid.generate();
  const { firstname, lastname, phone, email } = req.body;
  const INSERT_KHACHHANG = `INSERT INTO KHACHHANG VALUES (N'${customerId}', N'${lastname}', N'${firstname}', NULL, N'${phone}', NULL, NULL, N'${email}')`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(INSERT_KHACHHANG);
    })
    .then(() => res.status(200).json({ customerId: customerId }))
    .catch((err) => console.error(err));
});

//CHỈNH SỬA THÔNG TIN KHÁCH HÀNG BẰNG MÃ KHÁCH HÀNG
app.patch("/customers", (req, res) => {
  const {
    customerId,
    firstname,
    lastname,
    birthday,
    gender,
    phone,
    email,
    address,
  } = req.body;

  const UPDATE_KHACHHANG = `UPDATE KHACHHANG SET HOKH = N'${lastname}', TENKH = N'${firstname}', GIOITINH = N'${gender}', SDT = N'${phone}', DIACHI = N'${address}', NGAYSINH = '${birthday}', EMAIL = N'${email}' WHERE MAKH = N'${customerId}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(UPDATE_KHACHHANG);
    })
    .then(() => res.status(200).json({ error: false }))
    .catch((err) => console.error(err));
});

//----------------------------------------------------------------

//LẤY THÔNG TIN TÀI XẾ BẰNG MÃ TÀI XẾ
app.post("/drivers", (req, res) => {
  const { driverId } = req.body;

  const sql = `SELECT * FROM TAIXE WHERE MATX = '${driverId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        return res.json(data.recordset[0]);
      }
    });
  });
});

//GET ALL TAIXE
app.post("/admin/drivers", (req, res) => {
  const sql = `SELECT * FROM TAIXE`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        return res.json(data.recordset);
      }
    });
  });
});

//ĐĂNG KÍ TÀI XẾ MỚI
app.put("/drivers", (req, res) => {
  const {
    lastname,
    firstname,
    gender,
    birthday,
    identityNumber,
    email,
    phone,
    address,
    country,
  } = req.body;
  const driverId = shortid.generate();
  const dateAdded = moment()
    .utc(7)
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    .toISOString();

  let newBirthday = moment(birthday, "DD/MM/YYYY").utc(7).toISOString();

  const sql = `INSERT INTO TAIXE VALUES(N'${driverId}', N'${lastname}', N'${firstname}', '${dateAdded}', '${phone}', N'${gender}', '${newBirthday}', '${email}', N'${address}', '${identityNumber}', N'${country}')`;
  // console.log(sql);
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then(() => {
      res.status(200).json({ error: false, driverId: driverId });
    })
    .catch((err) => console.error(err));
});

app.patch("/drivers", (req, res) => {
  const {
    driverId,
    lastname,
    firstname,
    gender,
    birthday,
    email,
    phone,
    address,
    country,
  } = req.body;
  // const driverId = shortid.generate();
  // const dateAdded = moment()
  //   .utc(7)
  //   .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  //   .toISOString();

  let newBirthday = moment(birthday, "DD/MM/YYYY").utc(7).toISOString();

  const sql = `UPDATE TAIXE SET HOTX = N'${lastname}', TENTX = N'${firstname}', SDT = '${phone}', GIOITINH = N'${gender}', 
  NGAYSINH = '${newBirthday}', EMAIL = N'${email}', DIACHI = N'${address}', QUEQUAN = N'${country}' WHERE MATX = N'${driverId}'`;
  // console.log(sql);
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then(() => {
      return res.status(200).json({ error: false });
    })
    .catch((err) => console.error(err));
});
//-----------------------------------------------------------------

//----------------------------------------------------------------
//LẤY DỮ LIỆU CỦA NHÂN VIÊN
app.post("/employees", (req, res) => {
  const { employeeId } = req.body;

  const sql = `SELECT * FROM NHANVIEN JOIN TK_NHANVIEN ON NHANVIEN.MANV = TK_NHANVIEN.MANV WHERE NHANVIEN.MANV = '${employeeId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        return res.json(data.recordset[0]);
      }
    });
  });
});

//ĐĂNG KÍ NHÂN VIÊN MỚI
app.put("/employees", (req, res) => {
  const { lastname, firstname, birthday, email, phone } = req.body;
  const employeeId = shortid.generate();
  let newBirthday = moment(birthday, "DD/MM/YYYY").utc(7).toISOString();

  const sql = `INSERT INTO NHANVIEN VALUES ('${employeeId}', N'${lastname}', N'${firstname}','${newBirthday}', '${email}', '${phone}')`;
  const poolPromise = mssql.connect(config);
  console.log(sql);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => res.json({ error: false, employeeId: employeeId }))
    .catch((err) => console.error(err));
});

//-----------------------------------------------------------------

// GHI CUỐC XE VÀO DỮ LIỆU
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

  console.log(sql);
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then(() => {
      res.sendStatus(200);
      console.log("sucessfully added drive " + MACHUYEN);
    })
    .catch((err) => console.error(err));
});

//LẤY LỊCH SỬ ĐẶT XE CỦA KHÁCH HÀNG
app.get("/drives", (req, res, next) => {
  const { customerId, date } = req.query;
  if (!customerId) return next();

  const sql = `SELECT * FROM LS_DATXE WHERE MAKH = '${customerId}' AND NGAYDATXE = '${date}' ORDER BY GIODATXE ASC`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      // console.log(result.recordset[0]);
      res.json(result.recordset);
    })
    .catch((err) => console.error(err));
});

app.get("/drives/all", (req, res) => {
  const { customerId } = req.query;
  if (!customerId) return next();

  const sql = `SELECT * FROM LS_DATXE WHERE MAKH = '${customerId}' ORDER BY NGAYDATXE DESC, GIODATXE DESC`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      // console.log(result.recordset[0]);
      res.json(result.recordset);
    })
    .catch((err) => console.error(err));
});

//GET LICH SU CHAY XE CUA TAIXE
app.get("/drives", (req, res, next) => {
  const { driverId, date } = req.query;
  if (!date) return next();
  // console.log(date, driverId);
  const sql = `SELECT * FROM LS_DATXE WHERE MATX = N'${driverId}' AND NGAYDATXE = '${date}' ORDER BY GIODATXE DESC`;
  // console.log(sql);
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      res.json(result.recordset);
    })
    .catch((err) => console.error(err));
});

app.get("/drives", (req, res) => {
  const { driverId, dateStart, dateEnd } = req.query;
  // console.log(date, driverId);
  const sql = `SELECT * FROM LS_DATXE WHERE MATX = N'${driverId}' AND NGAYDATXE BETWEEN '${dateStart}' AND '${dateEnd}'`;
  // console.log(sql);
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      res.json(result.recordset);
    })
    .catch((err) => console.error(err));
});

//--------------------------------------------------------

app.get("/list", (req, res) => {
  const sql = `SELECT * FROM DANHSACHCHO`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      let data = [];
      for (let i = 0; i < result.recordset.length; i++) {
        if (result.recordset[i].TRANGTHAI == 0) data.push(result.recordset[0]);
      }
      return res.json(data);
    })
    .catch((err) => console.error(err));
}); //SHOW CÁC CUỐC XE

app.get("/list/:driveId", (req, res) => {
  const { driveId } = req.params;
  const sql = `SELECT * FROM DANHSACHCHO WHERE MACHUYEN = '${driveId}'`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      res.json(result.recordset[0]);
    })
    .catch((err) => console.error(err));
}); // TÌM KIẾM CUỐC XE THEO MA CHUYẾN

app.post("/list", (req, res) => {
  const { customerId, origin, destination, distance, discount, money } =
    req.body;
  const driveId = shortid.generate();

  const sql = `INSERT INTO DANHSACHCHO VALUES ('${driveId}', '${customerId}', NULL, CONVERT(date, GETDATE()), CONVERT(time, GETDATE()) ,N'${origin}',N'${destination}', '${distance}','${discount}', '${money}', '0')`;

  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        console.log("Thêm chuyến xe vào danh sách chờ");
        return res.json(driveId);
      }
    });
  });
}); //THÊM CUỐC XE VÀO DANH SÁCH CHỜ

app.delete("/list/:driveId", (req, res) => {
  const { driveId } = req.params;
  const sql = `DELETE FROM DANHSACHCHO WHERE MACHUYEN = '${driveId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        console.log(`Xoá chuyến xe ${driveId} khỏi danh sách chờ`);
      }
    });
  });
}); //XOÁ CHUYẾN XE KHỎI BẢNG TẠM

//CẬP NHẬT CHUYẾN XE CHUYỂN TRẠNG THÁI THÀNH 1
app.put("/list/:driveId", (req, res) => {
  const { driveId } = req.params;
  const sql = `UPDATE DANHSACHCHO SET TRANGTHAI = '1' WHERE MACHUYEN = '${driveId}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      else {
        console.log(`Cập nhật chuyến xe ${driveId} trạng thái là đang chạy`);
      }
    });
  });
});

//XOÁ KHÁCH HÀNG
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
//----------------------------------------

//-----------------------------------------
//GET VÍ CỦA TÀI XẾ
app.post("/wallets/", (req, res) => {
  const { driverId } = req.body;

  const SELECT_WALLET = `SELECT * FROM VI WHERE MATX = N'${driverId}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(SELECT_WALLET);
    })
    .then((result) => result.recordset[0])
    .then((data) => {
      res.status(200).json(data);
    });
});

//GET SỐ TIỀN CỦA TÀI XẾ ĐÓ
app.post("/wallets/money", (req, res) => {
  const { driverId } = req.body;
  if (!driverId) return;

  const SELECT_WALLET = `SELECT * FROM VI WHERE MATX = N'${driverId}'`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(SELECT_WALLET);
    })
    .then((result) => result.recordset[0])
    .then((data) => {
      res.status(200).json(data.TIEN);
    })
    .catch((err) => console.log(err));
});

//TẠO VÍ CHO TÀI XẾ THEO TÀI XẾ
app.put("/wallets", (req, res) => {
  const generateString = (length) => {
    const number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let string = "";
    for (let i = 0; i < length - 1; i++) {
      string += number[Math.floor(Math.random() * 10)];
    }
    return string;
  };

  const removeAccents = (str) => {
    var AccentsMap = [
      "aàảãáạăằẳẵắặâầẩẫấậ",
      "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
      "dđ",
      "DĐ",
      "eèẻẽéẹêềểễếệ",
      "EÈẺẼÉẸÊỀỂỄẾỆ",
      "iìỉĩíị",
      "IÌỈĨÍỊ",
      "oòỏõóọôồổỗốộơờởỡớợ",
      "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
      "uùủũúụưừửữứự",
      "UÙỦŨÚỤƯỪỬỮỨỰ",
      "yỳỷỹýỵ",
      "YỲỶỸÝỴ",
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
      var re = new RegExp("[" + AccentsMap[i].substr(1) + "]", "g");
      var char = AccentsMap[i][0];
      str = str.replace(re, char);
    }
    return str;
  };
  const walletId = shortid.generate();
  const accountNumber = "10" + generateString(10);
  const cardNumber = "970415" + generateString(10);
  const balance = 100000;
  const bankName = "Vietinbank";
  const { driverId, lastname, firstname } = req.body;
  const fullname = removeAccents(lastname + " " + firstname).toUpperCase();
  const INSERT_NEW_WALLET = `INSERT INTO VI VALUES('${walletId}', '${driverId}', '${accountNumber}', '${cardNumber}', '${fullname}', '${balance}', '${bankName}')`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(INSERT_NEW_WALLET);
    })
    .then(() => {
      res.status(200).json({ error: false });
    });
});

//CẬP NHẬT VÍ TÀI KHOẢN
app.patch("/wallets", (req, res) => {
  const { driverId, amount, detail } = req.body;
  // console.log(driverId, amount, detail);
  axios
    .post("http://localhost:3001/wallets", { driverId: driverId })
    .then((res) => res.data)
    .then((data) => {
      let balance = 0;

      if (detail == "NAP TIEN") {
        balance = parseInt(data.TIEN) + parseInt(amount);
      } else {
        balance = data.TIEN - amount;
      }
      // console.log(data);
      const UPDATE_MONEY = `UPDATE VI SET TIEN = '${balance}' WHERE MATX = '${driverId}'`;
      // console.log(UPDATE_MONEY);
      const poolPromise = mssql.connect(config);
      poolPromise
        .then(() => {
          return mssql.query(UPDATE_MONEY);
        })
        .then(() => {
          res.status(200).json({ error: false });
          axios
            .post("http://localhost:3001/wallets/histories", {
              driverId: driverId,
              walletId: data.MAVITIEN,
              amount: amount,
              balance: balance,
              detail: detail,
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ error: true });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: true });
    });
});

// GHI LẠI LỊCH SỬ GIAO DỊCH
app.post("/wallets/histories", (req, res) => {
  const { driverId, walletId, amount, balance, detail } = req.body;
  const tradeId = shortid.generate();

  const INSERT_WALLET_HISTORY = `INSERT INTO LS_GIAODICH (MAGIAODICH, MAVITIEN, MATX, NGAYGIAODICH, GIOGIAODICH, SOTIEN, SODU, NOIDUNG) VALUES ('${tradeId}', '${walletId}', '${driverId}', CONVERT(date, GETDATE()), CONVERT(time, GETDATE()), '${amount}', '${balance}' ,'${detail}')`;
  // console.log(INSERT_WALLET_HISTORY);
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(INSERT_WALLET_HISTORY);
    })
    .then(() => {
      res.status(200).json({ error: false });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: true });
    });
});

//LẤY LỊCH SỬ GIAO DỊCH THEO MATX
app.get("/wallets/histories", (req, res) => {
  let { driverId, date } = req.query;
  const sql = `SELECT GIOGIAODICH, NGAYGIAODICH, SODU, SOTIEN, NOIDUNG FROM LS_GIAODICH WHERE MATX = '${driverId}' AND NGAYGIAODICH = '${date}' ORDER BY GIOGIAODICH ASC`;
  // console.log(sql);
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((res) => res.recordset)
    .then((data) => {
      // console.log(data);
      res.status(200).json(data);
    });
});
//---------------------------------------------------

//---------------------------------------------------
//GET XE BANG MA XE
app.get("/vehicles/:vehicleId", (req, res, next) => {
  const { vehicleId } = req.params;
  if (!vehicleId) return next();
  console.log(vehicleId);
  const sql = `SELECT * FROM XE WHERE MAXE = '${vehicleId}'`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      // console.log(result.recordset[0]);
      res.json(result.recordset[0]);
    })
    .catch((err) => console.error(err));
});

//GET XE BANG MA TAIXE
app.get("/vehicles/:driverId", (req, res) => {
  const { driverId } = req.params;

  const sql = `SELECT * FROM XE WHERE MATX = '${driverId}'`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      // console.log(result.recordset[0]);
      res.json(result.recordset[0]);
    })
    .catch((err) => console.error(err));
});

//XÀI TRONG TRANG ADMIN
app.post("/vehicles/:driverId", (req, res) => {
  const { driverId } = req.params;

  const sql = `SELECT * FROM XE WHERE MATX = '${driverId}'`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      // console.log(result.recordset[0]);
      res.json(result.recordset[0]);
    })
    .catch((err) => console.error(err));
});

//Xài trong trang profile tài xế và pricepanel
app.post("/vehicles", (req, res) => {
  const { driverId } = req.body;

  const sql = `SELECT * FROM XE WHERE MATX = '${driverId}'`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      // console.log(result.recordset[0]);
      res.json(result.recordset[0]);
    })
    .catch((err) => console.error(err));
});

//THÊM XE CHO TÀI XẾ ĐÓ
app.put("/vehicles", (req, res) => {
  const { driverId, vehicleBrand, vehicleName, licensePlate, vehicleColor } =
    req.body;
  const vehicleId = shortid.generate();
  const sql = `INSERT INTO XE VALUES(N'${vehicleId}', N'${driverId}', N'${vehicleName}', N'${vehicleBrand}',N'${licensePlate}', N'${vehicleColor}')`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      return res.status(200).json({ error: false });
    })
    .catch((err) => console.error(err));
});

app.patch("/vehicles", (req, res) => {
  const { driverId, vehicleBrand, vehicleName, licensePlate, vehicleColor } =
    req.body;
  const sql = `UPDATE XE SET TENXE = N'${vehicleName}', HANGXE = N'${vehicleBrand}', BIENKIEMSOAT = N'${licensePlate}', MAUSAC = N'${vehicleColor}' WHERE MATX =  N'${driverId}'`;
  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(sql);
    })
    .then((result) => {
      return res.status(200).json({ error: false });
    })
    .catch((err) => console.error(err));
});
//--------------------------------------

//--------------------------------------
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
    .then(async () => {
      await sendRecoveryCode(email, recoveryCode);
    })
    .catch((err) => console.error(err));
});

app.get("/provinces", (req, res) => {
  res.json({
    provinces: [
      {
        idProvince: "01",
        name: "Thành phố Hà Nội",
      },
      {
        idProvince: "79",
        name: "Thành phố Hồ Chí Minh",
      },
      {
        idProvince: "31",
        name: "Thành phố Hải Phòng",
      },
      {
        idProvince: "48",
        name: "Thành phố Đà Nẵng",
      },
      {
        idProvince: "92",
        name: "Thành phố Cần Thơ",
      },
      {
        idProvince: "02",
        name: "Tỉnh Hà Giang",
      },
      {
        idProvince: "04",
        name: "Tỉnh Cao Bằng",
      },
      {
        idProvince: "06",
        name: "Tỉnh Bắc Kạn",
      },
      {
        idProvince: "08",
        name: "Tỉnh Tuyên Quang",
      },
      {
        idProvince: "10",
        name: "Tỉnh Lào Cai",
      },
      {
        idProvince: "11",
        name: "Tỉnh Điện Biên",
      },
      {
        idProvince: "12",
        name: "Tỉnh Lai Châu",
      },
      {
        idProvince: "14",
        name: "Tỉnh Sơn La",
      },
      {
        idProvince: "15",
        name: "Tỉnh Yên Bái",
      },
      {
        idProvince: "17",
        name: "Tỉnh Hoà Bình",
      },
      {
        idProvince: "19",
        name: "Tỉnh Thái Nguyên",
      },
      {
        idProvince: "20",
        name: "Tỉnh Lạng Sơn",
      },
      {
        idProvince: "22",
        name: "Tỉnh Quảng Ninh",
      },
      {
        idProvince: "24",
        name: "Tỉnh Bắc Giang",
      },
      {
        idProvince: "25",
        name: "Tỉnh Phú Thọ",
      },
      {
        idProvince: "26",
        name: "Tỉnh Vĩnh Phúc",
      },
      {
        idProvince: "27",
        name: "Tỉnh Bắc Ninh",
      },
      {
        idProvince: "30",
        name: "Tỉnh Hải Dương",
      },
      {
        idProvince: "33",
        name: "Tỉnh Hưng Yên",
      },
      {
        idProvince: "34",
        name: "Tỉnh Thái Bình",
      },
      {
        idProvince: "35",
        name: "Tỉnh Hà Nam",
      },
      {
        idProvince: "36",
        name: "Tỉnh Nam Định",
      },
      {
        idProvince: "37",
        name: "Tỉnh Ninh Bình",
      },
      {
        idProvince: "38",
        name: "Tỉnh Thanh Hóa",
      },
      {
        idProvince: "40",
        name: "Tỉnh Nghệ An",
      },
      {
        idProvince: "42",
        name: "Tỉnh Hà Tĩnh",
      },
      {
        idProvince: "44",
        name: "Tỉnh Quảng Bình",
      },
      {
        idProvince: "45",
        name: "Tỉnh Quảng Trị",
      },
      {
        idProvince: "46",
        name: "Tỉnh Thừa Thiên Huế",
      },
      {
        idProvince: "49",
        name: "Tỉnh Quảng Nam",
      },
      {
        idProvince: "51",
        name: "Tỉnh Quảng Ngãi",
      },
      {
        idProvince: "52",
        name: "Tỉnh Bình Định",
      },
      {
        idProvince: "54",
        name: "Tỉnh Phú Yên",
      },
      {
        idProvince: "56",
        name: "Tỉnh Khánh Hòa",
      },
      {
        idProvince: "58",
        name: "Tỉnh Ninh Thuận",
      },
      {
        idProvince: "60",
        name: "Tỉnh Bình Thuận",
      },
      {
        idProvince: "62",
        name: "Tỉnh Kon Tum",
      },
      {
        idProvince: "64",
        name: "Tỉnh Gia Lai",
      },
      {
        idProvince: "66",
        name: "Tỉnh Đắk Lắk",
      },
      {
        idProvince: "67",
        name: "Tỉnh Đắk Nông",
      },
      {
        idProvince: "68",
        name: "Tỉnh Lâm Đồng",
      },
      {
        idProvince: "70",
        name: "Tỉnh Bình Phước",
      },
      {
        idProvince: "72",
        name: "Tỉnh Tây Ninh",
      },
      {
        idProvince: "74",
        name: "Tỉnh Bình Dương",
      },
      {
        idProvince: "75",
        name: "Tỉnh Đồng Nai",
      },
      {
        idProvince: "77",
        name: "Tỉnh Bà Rịa - Vũng Tàu",
      },
      {
        idProvince: "80",
        name: "Tỉnh Long An",
      },
      {
        idProvince: "82",
        name: "Tỉnh Tiền Giang",
      },
      {
        idProvince: "83",
        name: "Tỉnh Bến Tre",
      },
      {
        idProvince: "84",
        name: "Tỉnh Trà Vinh",
      },
      {
        idProvince: "86",
        name: "Tỉnh Vĩnh Long",
      },
      {
        idProvince: "87",
        name: "Tỉnh Đồng Tháp",
      },
      {
        idProvince: "89",
        name: "Tỉnh An Giang",
      },
      {
        idProvince: "91",
        name: "Tỉnh Kiên Giang",
      },
      {
        idProvince: "93",
        name: "Tỉnh Hậu Giang",
      },
      {
        idProvince: "94",
        name: "Tỉnh Sóc Trăng",
      },
      {
        idProvince: "95",
        name: "Tỉnh Bạc Liêu",
      },
      {
        idProvince: "96",
        name: "Tỉnh Cà Mau",
      },
    ],
  });
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
