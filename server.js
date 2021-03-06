const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const customerRoute = require("./routes/customer.route");
const driverRoute = require("./routes/driver.route");
const employeeRoute = require("./routes/employee.route");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const axios = require("axios");
const moment = require("moment");
const cookieParser = require("cookie-parser");

let customersOnline = new Map();
let customersStore = new Map();
let driversOnline = new Map();
let driversStore = new Map();
let employeesOnline = new Map();
let employeesStore = new Map();
let rooms = new Map();
let drivesStore = new Map();
let driveRooms = new Map();
const drivePageRegex = /((http:\/\/localhost:3000\/driver\/drive\/)\w*)/;

app.set("views", "./views");
app.set("view-engine", "ejs");

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

app.use(function (req, res, next) {
  if (!req.user)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

const setSocketByCookie = (room, roomStore, socket, userId, role) => {
  let result = roomStore.get(userId);

  if (!result)
    room.set(userId, {
      socketId: socket.id,
      state: 0,
      driveId: null,
      url: socket.handshake.headers.referer,
    });
  else {
    result.socketId = socket.id;
    result.url = socket.handshake.headers.referer;
    room.set(userId, result);
  }

  socket.userId = userId;
  socket.role = role;
  socket.emit("SET_ID", socket.userId);
};

const getDriversOnline = () => {
  let drivers = [];
  for ([key, value] of driversOnline) {
    drivers.push(key);
  }
  return drivers;
};

io.on("connection", async (socket) => {
  console.log("run socket connection");
  var cookief = socket.request.headers.cookie;
  if (!cookief) return;
  var cookies = cookie.parse(cookief);
  let userId;

  if (cookies.token) {
    jwt.verify(cookies.token, "tx", (error, decoded) => {
      if (error) {
        return;
      } else {
        userId = decoded.id;
        setSocketByCookie(
          driversOnline,
          driversStore,
          socket,
          userId,
          "driver"
        );
      }
    });

    jwt.verify(cookies.token, "kh", (error, decoded) => {
      if (error) {
        return;
      } else {
        userId = decoded.id;
        setSocketByCookie(
          customersOnline,
          customersStore,
          socket,
          userId,
          "customer"
        );
      }
    });

    jwt.verify(cookies.token, "nv", (error, decoded) => {
      if (error) {
        return;
      } else {
        userId = decoded.id;
        setSocketByCookie(
          employeesOnline,
          employeesStore,
          socket,
          userId,
          "employee"
        );
      }
    });
  }

  let driversAreOnline = getDriversOnline();
  io.emit("GET_DRIVER_ONLINE", driversAreOnline);

  // console.log(driversOnline);
  console.log(socket.adapter.rooms);
  console.log(socket.id + " is online");
  console.log(socket.userId + " is online");
  // console.log(socket);

  // var room = socket.adapter.rooms.get(socket.id).size;
  console.log("DANH SACH PHONG", rooms);
  // console.log(room.size);
  console.log("DANH SACH KHACH HANG ONLINE", customersOnline);
  console.log("DANH SACH TAI XE ONLINE", driversOnline);
  // socket.on("connect_error", () => {
  //   console.log("There is error");
  // });

  //DANH S??CH C??C T??I X??? ??ANG ONLINE
  socket.on("GET_DRIVER_ONLINE", () => {
    let drivers = getDriversOnline();
    socket.emit("GET_DRIVER_ONLINE", drivers);
  });

  socket.on("CUSTOMER_GET_STATE", () => {
    const customer = customersOnline.get(socket.userId);
    let data;
    //th???c hi???n ki???m tra kh??ch h??ng.
    //n???u state c???a kh??ch h??ng == 0 th?? kh??ch h??ng ??ang kh??ng ?????t xe
    //==> kh??ng tr??? v??? drive data
    //n???u state != 0 th?? s??? tr??? v??? state data
    if (customer.state != 0 && customer.driveId) {
      const drive = rooms.get(customer.driveId);
      data = drive.detail;
    }
    console.log(data);
    //g???i d??? li???u state v?? th??ng tin cu???c xe hi???n t???i cho kh??ch h??ng
    io.to(socket.id).emit("CUSTOMER_SET_STATE", {
      state: customer.state,
      data: data,
    });
  });

  socket.on("CUSTOMER_SET_STATE", (newState) => {
    //l???y kh??ch h??ng trong danh s??ch kh??ch h??ng ??ang online
    const customer = customersOnline.get(socket.userId);
    //l???y c??c chi ti???t c???a kh??ch h??ng ????
    let { socketId, state, driveId } = customer;
    //n???u state thay ?????i l?? 0 t???c l?? ???? ???? ho??n th??nh xong ?????t xe
    //==> reset l???i driveId
    if (newState == 0) {
      driveId = null;
    }
    customersOnline.set(socket.userId, { socketId, state: newState, driveId });
  });

  //server l???ng nghe driver get state r???i tr??? v??? driver state hi???n t???i
  socket.on("DRIVER_GET_STATE", () => {
    const driver = driversOnline.get(socket.userId);
    // const { socketId, state, driveId } = driver;
    let data;
    if (driver.driveId) {
      const drive = rooms.get(driver.driveId);
      if (drive) {
        data = drive.detail;
      }
    }

    // console.log(data);
    io.to(socket.id).emit("DRIVER_SET_STATE", driver.state, data);
  });

  //driver thay ?????i state hi???n t???i c???a m??nh
  socket.on("DRIVER_SET_STATE", (newState) => {
    //l???y driver trong danh s??ch driver ??ang online
    let driver = driversOnline.get(socket.userId);
    //n???u state b???ng 0, t???c l?? t??i x??? ???? th???c hi???n xong cu???c xe
    //=> reset l???i driveId
    if (newState == 0) {
      driver.driveId = null;
    }
    //thay ?????i state cho driver ????
    driver.state = newState;
    //c???p nh???t l???i v??o danh s??ch driver ??ang online
    driversOnline.set(socket.userId, driver);
  });

  socket.on("UPDATE_LIST", () => {
    socket.broadcast.emit("RENDER_LIST");
  });

  socket.on("DRIVER_IS_WATCHING", (driveId) => {
    if (rooms.get(driveId) === undefined) {
      io.to(socket.id).emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/list/${driveId}`).catch(() => {});
      return;
    }
    let { drivers, customer, detail } = rooms.get(driveId);
    drivers = drivers.add(socket.id);
    rooms.set(driveId, { drivers, customer, detail });
    // console.log("DANH SACH PHONG", rooms);
  });

  socket.on("DRIVER_IS_NOT_WATCHING", (driveId) => {
    console.log("driver is not watching");
    if (rooms.get(driveId) === undefined) {
      io.to(socket.id).emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/${driveId}`).catch(() => {});
      return;
    }
    let { drivers, customer, detail } = rooms.get(driveId);
    drivers = drivers.delete(socket.id);
    rooms.set(driveId, { drivers, customer, detail });
    console.log("DANH SACH PHONG", rooms);
  });

  socket.on("DRIVER_CANCEL_DRIVE", (driveId) => {
    let drive = rooms.get(driveId);
    if (drive) {
      let customer = customersOnline.get(drive.detail.MAKH);
      if (customer) {
        customer.state = 0;
        customer.driveId = null;
        customersOnline.set(drive.detail.MAKH, driveId);
      }

      let driver = driversOnline.get(drive.detail.MATX);
      if (driver) {
        driver.state = 0;
        driver.driveId = null;
        driversOnline.set(drive.detail.MATX, driveId);
      }
      io.to(drive.customer).emit("DRIVE_NO_LONGER_EXIST");
      rooms.delete(driveId);

      axios
        .delete(`http://localhost:3001/list/${driveId}`)
        .catch((err) => console.error(err));
    }
  });

  //customer t??m driver
  socket.on("SEARCH_FOR_DRIVER", (driveId) => {
    axios
      .all([
        axios.get(`http://localhost:3001/list/${driveId}`),
        axios.post(`http://localhost:3001/customers/`, {
          customerId: socket.userId,
        }),
      ])
      .then((responseArr) => {
        return [responseArr[0].data, responseArr[1].data];
      })
      .then((data) => {
        console.log(data[1]);
        rooms.set(driveId, {
          drivers: new Set(),
          customer: socket.id,
          detail: { ...data[0], HOKH: data[1].HOKH, TENKH: data[1].TENKH },
        });
        const { socketId, state } = customersOnline.get(socket.userId);
        // console.log(socket.userId);
        customersOnline.set(socket.userId, {
          socketId,
          state,
          driveId: driveId,
        });
        // console.log(customersOnline);
      })
      .catch((err) => {});
  });

  //customer d???ng t??m driver
  socket.on("STOP_SEARCH", (driveId) => {
    if (rooms.get(driveId) === undefined) {
      socket.emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/${driveId}`).catch(() => {});
      return;
    }

    axios
      .delete(`http://localhost:3001/list/${driveId}`)
      .catch((err) => console.log(err));

    let { drivers, customer, detail } = rooms.get(driveId);
    for (const value of drivers) {
      drivers.delete(value);
      io.to(value).emit("DRIVE_NO_LONGER_EXIST");
    }
    rooms.set(driveId, { drivers, customer, detail });
  });

  //customer kh??ng ??i n???a (ch??? c?? hi???u l???c tr?????c state 2 c???a customer)
  socket.on("CUSTOMER_CANCEL_DRIVE", () => {
    let customer = customersOnline.get(socket.userId);
    let drive = rooms.get(customer.driveId);
    let driver = driversOnline.get(drive.detail.MATX);
    console.log(driver);
    let driveId = customer.driveId;

    if (customer) {
      customer.state = 0;
      customer.driveId = null;
      customersOnline.set(socket.userId, customer);
    }

    if (driver) {
      driver.state = 0;
      driver.driveId = null;
      driversOnline.set(drive.detail.MATX, customer);
      io.to(driver.socketId).emit("DRIVE_NO_LONGER_EXIST");
    }

    rooms.delete(driveId);

    axios
      .delete(`http://localhost:3001/list/${driveId}`)
      .catch((err) => console.error(err));

    socket.emit("RELOAD_PAGE");
  });

  socket.on("DRIVER_IS_HERE", (driveId) => {
    if (rooms.get(driveId) === undefined) {
      io.to(socket.id).emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/list/${driveId}`).catch(() => {});
      return;
    }
    let { drivers, customer, detail } = rooms.get(driveId);
    io.to(customer).emit("DRIVER_IS_HERE");
  });

  socket.on("DRIVER_TAKE_CUSTOMER", (driveId) => {
    let drive = rooms.get(driveId);
    if (!drive) {
      io.to(socket.id).emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/list/${driveId}`).catch(() => {});
      return;
    } else {
      let customer = customersOnline.get(drive.detail.MAKH);
      if (customer) {
        customer.state = 3;
        customersOnline.set(drive.detail.MAKH, customer);
        console.log(drive.detail.MAKH + " ?????i state th??nh 3");
      }
    }
  });

  socket.on("GET_DRIVE_DATA", (driveId) => {
    if (rooms.get(driveId) === undefined) {
      io.to(socket.id).emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/list/${driveId}`).catch(() => {});
      return;
    }
    let drive = rooms.get(driveId);
    // console.log(socket.id);
    io.to(socket.id).emit("GIVE_DRIVE_DATA", drive.detail);
  });

  socket.on("DRIVER_HAS_CHOSEN", (data) => {
    const { driveId, driverId, driverLocation } = data;
    if (rooms.get(driveId) === undefined) {
      socket.emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/${driveId}`).catch((err) => {
        console.error(err);
      });
      return;
    }

    axios
      .put(`http://localhost:3001/list/${driveId}`)
      .catch((err) => console.error(err));

    let { drivers, customer, detail } = rooms.get(driveId);
    let driver = driversOnline.get(socket.userId);
    driver.driveId = driveId;
    driversOnline.set(socket.userId, driver);

    for (const value of drivers) {
      if (value !== socket.id) {
        drivers.delete(value);
        io.to(value).emit("DRIVE_NO_LONGER_EXIST");
      } else {
        detail.MATX = socket.userId;
        detail.VITRITAIXE = driverLocation;
        rooms.set(driveId, { drivers, customer, detail });
        io.to(customer).emit("DRIVER_ON_THE_WAY", data);
        io.emit("DRIVER_ON_THE_WAY", data);
      }
    }
  });

  socket.on("FINISH", (driveId) => {
    //ki???m tra xe drive ???? t???n t???i hay kh??ng
    if (rooms.get(driveId) === undefined) {
      socket.emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/${driveId}`).catch(() => {});
      return;
    }

    //n???u drive t???n t???i th?? l???y d??? li???u
    let drive = rooms.get(driveId);
    drive.detail.MATX = socket.userId;

    let driver = driversOnline.get(drive.detail.MATX);
    if (driver) {
      driver.state = 0;
      driver.driveId = null; //set driveId c???a driver v??? 0
      driversStore.set(drive.detail.MAKH, driver);
    }

    //set state cho customer = 0
    //2 tr?????ng h???p t???t c???
    let customer = customersOnline.get(drive.detail.MAKH);
    //Tr?????ng h???p customer online ?????n khi nh???n ho?? ????n, ==> set state = 0
    if (customer) {
      customer.state = 0;
      customer.driveId == null; //set driveId c???a customer v??? 0
      customersOnline.set(drive.detail.MAKH, customer);
      io.to(drive.customer).emit("RELOAD_PAGE");
    }
    //Tr?????ng h???p customer ???? off t??? l??u, ==> kh??ng c???n setState
    //Tr?????ng h???p customer m???i r???i ??i t???c th??, d??? li???u c??n l??u trong customersStore
    customer = customersStore.get(drive.detail.MAKH);
    if (customer) {
      customer.state = 0;
      customer.driveId = null; //set driveId c???a customer v??? 0
      customersStore.set(drive.detail.MAKH, customer);
    }

    //c???p nh???t danh s??ch l??i xe
    axios
      .post(`http://localhost:3001/drives/`, drive.detail)
      .catch((err) => console.error(err));

    //tr??? ti???n chi???t kh???u
    axios
      .patch(`http://localhost:3001/wallets`, {
        driverId: socket.userId,
        amount: drive.detail.TIENCHIETKHAU,
        detail: "CHIET KHAU",
      })
      .catch((err) => console.error(err));

    axios
      .delete(`http://localhost:3001/list/${driveId}`)
      .catch((err) => console.error(err));

    //xo?? drive kh???i danh s??ch ph??ng
    rooms.delete(driveId);
    //driver s??? t??? set state = 0
  });

  socket.on("disconnect", () => {
    //ki???m tra customer hay customer r???i ??i??
    //n???u l?? customer
    if (socket.role == "customer") {
      let userId = socket.userId;
      let customer = customersOnline.get(socket.userId);
      //L??u d??? li???u c???a customer v???a m???i r???i ??i v??o customer store
      customersStore.set(socket.userId, customersOnline.get(socket.userId));
      //customer kh??ng online n???a => xo?? customer trong customer online ??i
      customersOnline.delete(socket.userId);
      console.log(customer);
      customer = customersStore.get(userId);
      if (customer.state > 1 && customer.state < 3) {
        console.log("V??o tr???ng th??i ?????c bi???t");
        //?????t ?????m ng?????c
        setTimeout(() => {
          let customerAfter = customersOnline.get(socket.userId);
          //TRONG 10s n???u t??i x??? online l???i th?? s??? ti???p t???c
          if (customerAfter) {
            console.log("kh??ch h??ng tr??? l???i");
            return;
          }
          //Trong 10s customer kh??ng online th?? xo?? d??? li???u trong customer Store
          else {
            console.log("kh??ch h??ng r???i ??i ho??n to??n");
            //N???u trong 5 gi??y m?? customer kh??ng quay tr??? l???i?
            let customerAterAfter = customersStore.get(socket.userId);

            if (customerAterAfter) {
              let driveId = customerAterAfter.driveId;
              let drive = rooms.get(customerAterAfter.driveId);
              //th?? s??? xo?? ph??ng ???? r???i xo?? driveId trong customer t??i x???
              let driver = driversOnline.get(drive.detail.MATX);

              //set state t??i x??? v??? 0
              if (driver) {
                driver.state = 0;
                driver.driveId = null; //set ?????a ??i???m v??? null
                driversOnline.set(drive.detail.MATX, driver);
                //Th??ng b??o v???i t??i x??? l?? chuy???n ???? hu???
                io.to(driver.socketId).emit("DRIVE_NO_LONGER_EXIST");
              }
              //Xo?? cu???c xe
              rooms.delete(driveId);

              //Xo?? cu???c xe trong danh s??ch ch???
              axios
                .delete(`http://localhost:3001/list/${driveId}`)
                .catch((err) => console.error(err));

              customersStore.delete(socket.userId);
              console.log(socket.userId + " truely left");
            }
          }
        }, 1000 * 30);
      }
    }

    //N???u l?? driver th??:
    else if (socket.role == "driver") {
      //L??u d??? li???u drive v??o drive Store
      let driver = driversOnline.get(socket.userId);
      // let driverId = socket.userId;
      if (driver && driver.driveId) {
        drivesStore.set(driver.driveId, rooms.get(driver.driveId));
      }
      //L??u d??? li???u c???a driver v???a m???i r???i ??i v??o driver store
      driversStore.set(socket.userId, driversOnline.get(socket.userId));

      //driver kh??ng online n???a => xo?? driver trong customer online
      driversOnline.delete(socket.userId);
      //N???u driver r???i trang drive v?? state c???a driver l???n h??n 0
      if (driver.state > 0 && drivePageRegex.test(driver.url)) {
        console.log("T??i x??? c?? state l???n h??n 10 v?? r???i trang drive");
        //?????t ?????m ng?????c l?? 10s
        setTimeout(() => {
          //N???u sau 10s t??i x??? v???n online
          let driverAfter = driversOnline.get(socket.userId);
          if (driverAfter && !drivePageRegex.test(driverAfter.url)) {
            console.log("T??i x??? online nh??ng kh??ng trong trong trang drive");
            setTimeout(() => {
              let driverAfterAfter = driversOnline.get(socket.userId);

              if (
                driverAfterAfter &&
                drivePageRegex.test(driverAfterAfter.url)
              ) {
                console.log("kh??ng xo?? cu???c xe");
                return;
              } else {
                console.log("Xo?? lu??n cu???c xe");
                let drive = rooms.get(driverAfterAfter.driveId);
                if (drive) {
                  let customer = customersOnline.get(drive.detail.MAKH);
                  if (customer) {
                    customer.state = 0;
                    customer.driveId = null;
                    customersOnline.set(drive.detail.MAKH, customer);
                    io.to(drive.customer).emit("DRIVE_NO_LONGER_EXIST");
                  }
                  let driveId = driverAfterAfter.driveId;
                  driverAfterAfter.state = 0;
                  driverAfterAfter.driveId = null;
                  driversOnline.set(drive.detail.MATX, driverAfter);
                  rooms.delete(driveId);

                  axios
                    .delete(`http://localhost:3001/list/${driveId}`)
                    .catch((err) => console.error(err));
                }
              }
            }, 1000 * 30);
          } else if (driverAfter && drivePageRegex.test(driverAfter.url)) {
            console.log("T??i x??? online nh??ng trong trang drive");
            return;
          } else {
            console.log("T??i x??? ???? offline");
            let driverAfterAfterAfter = driversStore.get(socket.userId);
            if (driverAfterAfterAfter) {
              let drive = rooms.get(driverAfterAfterAfter.driveId);
              let driveId = driverAfterAfterAfter.driveId;
              if (drive) {
                let customer = customersOnline.get(drive.detail.MAKH);
                console.log(customer);
                if (customer) {
                  customer.state = 0;
                  customer.driveId = null;
                  customersOnline.set(drive.detail.MAKH, customer);
                  io.to(drive.customer).emit("DRIVE_NO_LONGER_EXIST");
                }
                rooms.delete(driveId);
                driversStore.delete(socket.userId);
                console.log(socket.userId + " truely left");

                axios
                  .delete(`http://localhost:3001/list/${driveId}`)
                  .catch((err) => console.error(err));
              }
            }
          }
        }, 1000 * 30);
      }
      // else if (driver.state == 0 && !drivePageRegex.test(driver.url)) {
      //   //?????t ?????m ng?????c l?? 10 gi??y
      //   setTimeout(() => {
      //     //N???u TRONG 10s m?? driver ti???p t???c online th?? s??? load l???i d??? li???u tr?????c ???? c???a driver
      //     if (driversOnline.get(socket.userId)) {
      //       return;
      //     }
      //     //N???u TRONG 10s driver KH??NG quay l???i th??
      //     else {
      //       let drive = rooms.get(driversStore.driveId);
      //       if (drive) {
      //         let customer = customersOnline.get(drive.detail.MAKH);
      //         if (customer) {
      //           customer.state = 0;
      //           customer.driveId = null;
      //           customersOnline.set(drive.detail.MAKH, customer);
      //           io.to(drive.customer).emit("DRIVE_NO_LONGER_EXIST");
      //         }
      //         rooms.delete(driversStore.driveId);
      //         let driveId = driversStore.driveId;
      //         axios
      //           .delete(`http://localhost:3001/list/${driveId}`)
      //           .catch((err) => console.error(err));
      //       }
      //       //Xo?? d??? li???u trong driver store lu??n
      //       driversStore.delete(socket.userId);
      //       console.log(socket.userId + " truely left");
      //     }
      //   }, 1000 * 20);
      // }
    }
    console.log(socket.userId + " left");
    let driversAreOnline = getDriversOnline();
    io.emit("GET_DRIVER_ONLINE", driversAreOnline);
  });
});

app.use("/driver", driverRoute);

app.use("/customer", customerRoute);

app.use("/employee", employeeRoute);

app.get("*", function (req, res) {
  res.render("NotFound.ejs", {
    title: "Not Found",
  });
});

// process.on("unhandledRejection", (reason, p) => {
//   console.error("Unhandled Rejection at:", p, "reason:", reason);
//   process.exit(1);
// });

server.listen(process.env.PORT || port);
console.log(`Example app listening at http://localhost:${port}`);
