const express = require("express");
const router = express.Router({ strict: true });
const config = require("../sqlConfig");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { default: axios } = require("axios");
const moment = require("moment");

router.use(cookieParser());
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

router.get("/", checkAuthenticated, (req, res) => {
  const { token } = req.cookies;
  let driverId;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    driverId = decoded.id;
  });

  axios
    .post(`http://localhost:3001/drivers`, {
      driverId: driverId,
    })
    .then((results) => results.data)
    .then((data) => {
      res.render("driver.ejs", {
        data: data,
        title: "Tài xế",
        socket: true,
      });
    });
});

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", {
    title: "Đăng nhập",
    // action: "/driver/login",
    path: "driver",
    register: false,
    socket: false,
  });
});

router.post("/login", checkNotAuthenticated, (req, res) => {
  const { username, password } = req.body;

  axios
    .post(`http://localhost:3001/accounts/drivers`, {
      username: username,
      password: password,
    })
    .then((response) => {
      return response.data;
    })
    .then((data) => {
      if (data.error) return res.json({ error: true });
      const token = jwt.sign({ id: data.driverId }, "tx");
      return res
        .status(201)
        .cookie("token", token, {
          expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
        })
        .json({ error: false, url: "/driver" });
    })
    .catch((error) => console.log(error));
});

router.get("/forgot-password", checkNotAuthenticated, (req, res) => {
  res.render("forgotPassword.ejs", {
    title: "Quên mật khẩu",
    path: "driver",
    socket: false,
  });
});

router.get("/drive/:driveId", (req, res) => {
  const { driveId } = req.params;
  const { token } = req.cookies;
  let driverId;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    driverId = decoded.id;
  });

  axios
    .all([
      axios.post(`http://localhost:3001/drivers`, {
        driverId: driverId,
      }),
      axios.get(`http://localhost:3001/list/${driveId}`),
    ])
    .then((results) => {
      return { ...results[0].data, ...results[1].data };
    })
    .then((data) => {
      res.render("drive.ejs", {
        data: data,
        driveId: driveId,
        origin: data.DIEMDON,
        destination: data.DIEMDEN,
        distance: data.QUANGDUONG,
        money: data.TIEN,
        vietnamMoneyFormat: vietnamMoneyFormat,
        kilometerFormat: kilometerFormat,
        socket: true,
      });
    });
  axios
    .get(`http://localhost:3001/list/${driveId}`)
    .then((res) => res.json())
    .then((data) => {});
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
  let driverId;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    driverId = decoded.id;
  });

  axios
    .post(`http://localhost:3001/drivers`, {
      driverId: driverId,
    })
    .then((results) => results.data)
    .then((data) => {
      res.render("driverHistory.ejs", {
        data: data,
        title: "Lịch sử",
        socket: true,
        path: "driver",
      });
    })
    .catch((err) => console.error(err));
});

router.get("/profile", checkAuthenticated, (req, res) => {
  let driverId;
  const { token } = req.cookies;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    else driverId = decoded.id;
  });

  axios
    .all([
      axios.post(`http://localhost:3001/drivers`, {
        driverId: driverId,
      }),
      axios.post(`http://localhost:3001/vehicles`, {
        driverId: driverId,
      }),
      axios.post(`http://localhost:3001/accounts/drivers`, {
        driverId: driverId,
      }),
    ])
    .then((results) => {
      return { ...results[0].data, ...results[1].data, ...results[2].data };
    })
    .then((data) => {
      res.render("profile.ejs", {
        path: "driver",
        moment: moment,
        data: data,
        title: "Thông tin tài xế",
        socket: true,
        removeAccents: removeAccents,
      });
    });
});

router.get("/wallet", checkAuthenticated, (req, res) => {
  const { token } = req.cookies;
  let driverId;
  jwt.verify(token, "tx", (err, decoded) => {
    if (err) console.log(err);
    driverId = decoded.id;
  });

  axios
    .all([
      axios.post(`http://localhost:3001/wallets/money`, { driverId: driverId }),
      axios.post(`http://localhost:3001/drivers`, { driverId: driverId }),
    ])
    .then((results) => [results[0].data, results[1].data])
    .then((data) => {
      res.render("wallet.ejs", {
        title: "Ví",
        data: data[1],
        balance: data[0],
        vietnamMoneyFormat: vietnamMoneyFormat,
        socket: true,
      });
    })
    .catch((err) => console.log(err));
});

function checkAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "tx", (err, decoded) => {
      if (!decoded) {
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

const kilometerFormat = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "unit",
    unit: "kilometer",
  });
  return formatter.format(number);
};

const vietnamMoneyFormat = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return formatter.format(number);
};

module.exports = router;
