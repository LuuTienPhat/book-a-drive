const mssql = require("mssql");
const config = require("../sqlConfig");
const md5 = require("md5");
const shortid = require("shortid");
const jwt = require("jsonwebtoken");

module.exports.renderCustomerPage = async (req, res) => {
  const { token } = req.cookies;
  let customerCode;
  jwt.verify(token, "kh", (err, decoded) => {
    if (err) console.log(err);
    customerCode = decoded.id;
  });

  let customerData;

  const SELECT_CUSTOMER = `SELECT * FROM KHACHHANG WHERE MAKH = N'${customerCode}'`;
  const SELECT_HISTORY = `SELECT TOP 3 * FROM LS_DATXE WHERE MAKH = N'${customerCode}' ORDER BY NGAYDATXE DESC, GIODATXE DESC`;

  const poolPromise = mssql.connect(config);
  poolPromise
    .then(() => {
      return mssql.query(SELECT_CUSTOMER);
    })
    .then((result) => {
      customerData = result.recordset[0];
    })
    .then(() => {
      return mssql.query(SELECT_HISTORY);
    })
    .then((result) => {
      res.render("index.ejs", {
        data: customerData,
        title: "Đặt xe",
        histories: result.recordset,
      });
    })
    .catch((err) => console.error(err));
};

module.exports.renderLoginPage = (req, res) => {
  res.render("login.ejs", {
    title: "Đăng nhập",
    action: "/customer/login",
    register: "/customer/register",
    error: false,
  });
};

module.exports.renderRegisterPage = (req, res) => {
  res.render("register.ejs", {
    title: "Đăng ký",
    action: "/customer/register",
  });
};

module.exports.renderSearchPage = (req, res) => {
  res.render("search.ejs");
};

module.exports.postLoginPage = (req, res) => {
  const { username, password } = req.body;
  const SELECT_CUSTOMER = `SELECT * FROM TK_KHACHHANG WHERE TENDANGNHAP = N'${username}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(SELECT_CUSTOMER, (err, data) => {
      if (err) console.log(err);

      const receivedData = data.recordset[0];
      if (receivedData == null) {
        return res.json({ error: true });
      } else {
        if (receivedData.MATKHAU == md5(password)) {
          const token = jwt.sign({ id: receivedData.MAKH }, "kh");
          res
            .status(201)
            .cookie("token", token, {
              expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
            })
            .json({ error: false, url: "/customer" });
        } else {
          return res.json({ error: true });
        }
      }
    });
  });
};

module.exports.renderForgotPasswordPage = (req, res) => {
  res.render("forgotPassword.ejs", {
    title: "Quên mật khẩu",
  });
};

module.exports.logOut = (req, res) => {
  console.log("run");
  return res
    .status(201)
    .cookie("token", "", {
      expires: new Date("Thu, 01 Jan 1970 00:00:00 UTC"),
      path: "/",
    })
    .redirect("/customer/login");
};

module.exports.postRegisterPage = (req, res) => {
  const customerCode = shortid.generate();
  const { firstname, lastname, phone, email, username, password } = req.body;
  const newPassword = md5(password);

  const INSERT_KHACHHANG = `INSERT INTO KHACHHANG(MAKH, HOKH, TENKH, GIOITINH, SDT, DIACHI, NGAYSINH, EMAIL) VALUES ('${customerCode}', N'${lastname}', N'${firstname}', N'', N'${phone}', N'', N'', N'${email}')`;
  const INSERT_TAIKHOAN = `INSERT INTO TK_KHACHHANG(MAKH,TENDANGNHAP, MATKHAU) VALUES ('${customerCode}', N'${username}', '${newPassword}')`;

  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();
    mssqlRequest.query(INSERT_KHACHHANG, (err, data) => {
      if (err) console.log(err);

      mssqlRequest.query(INSERT_TAIKHOAN, (err, data) => {
        if (err) console.log(err);
        else res.status(200).json({ url: "/customer/login" });
      });
    });
  });
};

module.exports.renderProfilePage = (req, res) => {
  let id;
  const { token } = req.cookies;
  jwt.verify(token, "kh", (err, decoded) => {
    if (err) console.log(err);
    else id = decoded.id;
  });

  const sql = `SELECT * FROM KHACHHANG JOIN TK_KHACHHANG ON KHACHHANG.MAKH = TK_KHACHHANG.MAKH WHERE KHACHHANG.MAKH = N'${id}'`;
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();

    mssqlRequest.query(sql, (err, data) => {
      if (err) console.log(err);
      res.render("profile.ejs", {
        data: data.recordset[0],
        title: "Thông tin khách hàng",
      });

      mssql.close();
    });
  });
};

module.exports.putProfilePage = (req, res) => {
  let id;
  const { token } = req.cookies;
  jwt.verify(token, "kh", (err, decoded) => {
    if (err) console.log(err);
    else id = decoded.id;
  });

  const {
    firstname,
    lastname,
    birthday,
    gender,
    phone,
    email,
    // username,
    // password,
    address,
  } = req.body;
  // const newPassword = md5(password);

  const UPDATE_KHACHHANG = `UPDATE KHACHHANG SET HOKH = N'${lastname}', TENKH = N'${firstname}', GIOITINH = N'${gender}', SDT = N'${phone}', DIACHI = N'${address}', NGAYSINH = '${birthday}', EMAIL = N'${email}' WHERE MAKH = '${id}'`;
  // const UPDATE_TAIKHOAN = `UPDATE TK_KHACHHANG SET TENDANGNHAP =  N'${username}', MATKHAU = '${newPassword}' WHERE MAKH = '${customerCode}'`;
  // console.log(UPDATE_KHACHHANG);
  mssql.connect(config, (err) => {
    if (err) console.log(err);
    let mssqlRequest = new mssql.Request();
    mssqlRequest.query(UPDATE_KHACHHANG, (err, data) => {
      if (err) console.log(err);

      // mssqlRequest.query(UPDATE_TAIKHOAN, (err, data) => {
      //   if (err) console.log(err);
      //   else res.status(200).json({ url: "/customer/login" });
      // });
    });
  });
};

module.exports.checkAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  if (token) next();
  else return res.redirect("/customer/login");
};

module.exports.checkNotAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) next();
  else return res.redirect("/customer");
  // const result = jwt.verify("kh", token);
  // try {
  //   if (result) {
  //     return res.redirect("/customer");
  //   }
  // } catch (error) {
  //   next();
  // }
};
