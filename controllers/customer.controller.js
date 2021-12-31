const mssql = require("mssql");
const config = require("../sqlConfig");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { default: axios } = require("axios");

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

module.exports.renderCustomerPage = async (req, res) => {
  const { token } = req.cookies;
  let customerId;
  jwt.verify(token, "kh", (err, decoded) => {
    if (err) console.log(err);
    customerId = decoded.id;
  });

  let customerData;

  const SELECT_CUSTOMER = `SELECT * FROM KHACHHANG WHERE MAKH = N'${customerId}'`;
  const SELECT_HISTORY = `SELECT TOP 3 * FROM LS_DATXE WHERE MAKH = N'${customerId}' ORDER BY NGAYDATXE DESC, GIODATXE DESC`;
  axios
    .all([
      axios.post(`http://localhost:3001/customers`, {
        customerId: customerId,
      }),
      axios.get(`http://localhost:3001/drives/all?customerId=${customerId}`),
    ])
    .then((results) => {
      return { ...results[0].data, histories: results[1].data };
    })
    .then((data) => {
      res.render("index.ejs", {
        data: data,
        title: "Đặt xe",
        histories: data.histories.slice(0, 3),
        socket: true,
      });
    });
};

module.exports.renderLoginPage = (req, res) => {
  res.render("login.ejs", {
    title: "Đăng nhập",
    path: "customer",
    socket: false,
  });
};

module.exports.renderRegisterPage = (req, res) => {
  res.render("register.ejs", {
    title: "Đăng ký",
    action: "/customer/register",
    socket: false,
  });
};

module.exports.renderSearchPage = (req, res) => {
  res.render("search.ejs");
};

module.exports.postLoginPage = (req, res) => {
  const { username, password } = req.body;

  axios
    .post(`http://localhost:3001/accounts/customers`, {
      username: username,
      password: password,
    })
    .then((response) => response.data)
    .then((data) => {
      if (data.error) res.json({ error: true });
      const token = jwt.sign({ id: data.customerId }, "kh");
      return res
        .status(201)
        .cookie("token", token, {
          expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
        })
        .json({ error: false, url: "/customer" });
    });
};

module.exports.renderForgotPasswordPage = (req, res) => {
  res.render("forgotPassword.ejs", {
    title: "Quên mật khẩu",
    path: "customer",
    socket: false,
  });
};

module.exports.logOut = (req, res) => {
  return res
    .status(201)
    .cookie("token", "", {
      expires: new Date("Thu, 01 Jan 1970 00:00:00 UTC"),
      path: "/",
    })
    .redirect("/customer/login");
};

module.exports.renderHistoryPage = (req, res) => {
  const { token } = req.cookies;
  let customerId;
  jwt.verify(token, "kh", (err, decoded) => {
    if (err) console.log(err);
    customerId = decoded.id;
  });

  axios
    .post("http://localhost:3001/customers", { customerId: customerId })
    .then((result) => result.data)
    .then((data) => {
      return res.render("driverHistory.ejs", {
        data: data,
        title: "Lịch sử đặt xe",
        path: "customer",
        socket: true,
      });
    });
};

module.exports.renderProfilePage = (req, res) => {
  let customerId;
  const { token } = req.cookies;
  jwt.verify(token, "kh", (err, decoded) => {
    if (err) console.log(err);
    else customerId = decoded.id;
  });

  axios
    .post(`http://localhost:3001/customers`, {
      customerId: customerId,
    })
    .then((result) => result.data)
    .then((data) => {
      res.render("profile.ejs", {
        moment: moment,
        data: data,
        title: "Thông tin khách hàng",
        path: "customer",
        socket: true,
        removeAccents: removeAccents,
      });
    });
};

module.exports.putProfilePage = (req, res) => {
  const { firstname, lastname, birthday, gender, phone, email, address } =
    req.body;
  let customerId;
  const { token } = req.cookies;
  jwt.verify(token, "kh", (err, decoded) => {
    if (err) console.log(err);
    else customerId = decoded.id;
  });

  axios
    .patch("http://localhost:3001/customers", {
      customerId: customerId,
      firstname: firstname,
      lastname: lastname,
      birthday: moment.utc(birthday, "DD/MM/YYYY").toISOString(),
      gender: gender,
      phone: phone,
      email: email,
      address: address,
    })
    .then((result) => result.data)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
};
