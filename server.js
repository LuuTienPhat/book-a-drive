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

  //DANH SÁCH CÁC TÀI XẾ ĐANG ONLINE
  socket.on("GET_DRIVER_ONLINE", () => {
    let drivers = getDriversOnline();
    socket.emit("GET_DRIVER_ONLINE", drivers);
  });

  socket.on("CUSTOMER_GET_STATE", () => {
    const customer = customersOnline.get(socket.userId);
    let data;
    //thực hiện kiểm tra khách hàng.
    //nếu state của khách hàng == 0 thì khách hàng đang không đặt xe
    //==> không trả về drive data
    //nếu state != 0 thì sẽ trả về state data
    if (customer.state != 0 && customer.driveId) {
      const drive = rooms.get(customer.driveId);
      data = drive.detail;
    }
    console.log(data);
    //gửi dữ liệu state và thông tin cuốc xe hiện tại cho khách hàng
    io.to(socket.id).emit("CUSTOMER_SET_STATE", {
      state: customer.state,
      data: data,
    });
  });

  socket.on("CUSTOMER_SET_STATE", (newState) => {
    //lấy khách hàng trong danh sách khách hàng đang online
    const customer = customersOnline.get(socket.userId);
    //lấy các chi tiết của khách hàng đó
    let { socketId, state, driveId } = customer;
    //nếu state thay đổi là 0 tức là đã đã hoàn thành xong đặt xe
    //==> reset lại driveId
    if (newState == 0) {
      driveId = null;
    }
    customersOnline.set(socket.userId, { socketId, state: newState, driveId });
  });

  //server lắng nghe driver get state rồi trả về driver state hiện tại
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

  //driver thay đổi state hiện tại của mình
  socket.on("DRIVER_SET_STATE", (newState) => {
    //lấy driver trong danh sách driver đang online
    let driver = driversOnline.get(socket.userId);
    //nếu state bằng 0, tức là tài xế đã thực hiện xong cuốc xe
    //=> reset lại driveId
    if (newState == 0) {
      driver.driveId = null;
    }
    //thay đổi state cho driver đó
    driver.state = newState;
    //cập nhật lại vào danh sách driver đang online
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

  //customer tìm driver
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

  //customer dừng tìm driver
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

  //customer không đi nữa (chỉ có hiệu lực trước state 2 của customer)
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
        console.log(drive.detail.MAKH + " đổi state thành 3");
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
    //kiểm tra xe drive đó tồn tại hay không
    if (rooms.get(driveId) === undefined) {
      socket.emit("DRIVE_NO_LONGER_EXIST");
      axios.delete(`http://localhost:3001/${driveId}`).catch(() => {});
      return;
    }

    //nếu drive tồn tại thì lấy dữ liệu
    let drive = rooms.get(driveId);
    drive.detail.MATX = socket.userId;

    let driver = driversOnline.get(drive.detail.MATX);
    if (driver) {
      driver.state = 0;
      driver.driveId = null; //set driveId của driver về 0
      driversStore.set(drive.detail.MAKH, driver);
    }

    //set state cho customer = 0
    //2 trường hợp tất cả
    let customer = customersOnline.get(drive.detail.MAKH);
    //Trường hợp customer online đến khi nhận hoá đơn, ==> set state = 0
    if (customer) {
      customer.state = 0;
      customer.driveId == null; //set driveId của customer về 0
      customersOnline.set(drive.detail.MAKH, customer);
      io.to(drive.customer).emit("RELOAD_PAGE");
    }
    //Trường hợp customer đã off từ lâu, ==> không cần setState
    //Trường hợp customer mới rời đi tức thì, dữ liệu còn lưu trong customersStore
    customer = customersStore.get(drive.detail.MAKH);
    if (customer) {
      customer.state = 0;
      customer.driveId = null; //set driveId của customer về 0
      customersStore.set(drive.detail.MAKH, customer);
    }

    //cập nhật danh sách lái xe
    axios
      .post(`http://localhost:3001/drives/`, drive.detail)
      .catch((err) => console.error(err));

    //trừ tiền chiết khấu
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

    //xoá drive khỏi danh sách phòng
    rooms.delete(driveId);
    //driver sẽ tự set state = 0
  });

  socket.on("disconnect", () => {
    //kiểm tra customer hay customer rời đi??
    //nếu là customer
    if (socket.role == "customer") {
      let userId = socket.userId;
      let customer = customersOnline.get(socket.userId);
      //Lưu dữ liệu của customer vừa mới rời đi vào customer store
      customersStore.set(socket.userId, customersOnline.get(socket.userId));
      //customer không online nữa => xoá customer trong customer online đi
      customersOnline.delete(socket.userId);
      console.log(customer);
      customer = customersStore.get(userId);
      if (customer.state > 1 && customer.state < 3) {
        console.log("Vào trạng thái đặc biệt");
        //Đặt đếm ngược
        setTimeout(() => {
          let customerAfter = customersOnline.get(socket.userId);
          //TRONG 10s nếu tài xế online lại thì sẽ tiếp tục
          if (customerAfter) {
            console.log("khách hàng trở lại");
            return;
          }
          //Trong 10s customer không online thì xoá dữ liệu trong customer Store
          else {
            console.log("khách hàng rời đi hoàn toàn");
            //Nếu trong 5 giây mà customer không quay trở lại?
            let customerAterAfter = customersStore.get(socket.userId);

            if (customerAterAfter) {
              let driveId = customerAterAfter.driveId;
              let drive = rooms.get(customerAterAfter.driveId);
              //thì sẽ xoá phòng đó rồi xoá driveId trong customer tài xế
              let driver = driversOnline.get(drive.detail.MATX);

              //set state tài xế về 0
              if (driver) {
                driver.state = 0;
                driver.driveId = null; //set Địa điểm về null
                driversOnline.set(drive.detail.MATX, driver);
                //Thông báo với tài xế là chuyến đã huỷ
                io.to(driver.socketId).emit("DRIVE_NO_LONGER_EXIST");
              }
              //Xoá cuốc xe
              rooms.delete(driveId);

              //Xoá cuốc xe trong danh sách chờ
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

    //Nếu là driver thì:
    else if (socket.role == "driver") {
      //Lưu dữ liệu drive vào drive Store
      let driver = driversOnline.get(socket.userId);
      // let driverId = socket.userId;
      if (driver && driver.driveId) {
        drivesStore.set(driver.driveId, rooms.get(driver.driveId));
      }
      //Lưu dữ liệu của driver vừa mới rời đi vào driver store
      driversStore.set(socket.userId, driversOnline.get(socket.userId));

      //driver không online nữa => xoá driver trong customer online
      driversOnline.delete(socket.userId);
      //Nếu driver rời trang drive và state của driver lớn hơn 0
      if (driver.state > 0 && drivePageRegex.test(driver.url)) {
        console.log("Tài xế có state lớn hơn 10 và rời trang drive");
        //Đặt đếm ngược là 10s
        setTimeout(() => {
          //Nếu sau 10s tài xế vẫn online
          let driverAfter = driversOnline.get(socket.userId);
          if (driverAfter && !drivePageRegex.test(driverAfter.url)) {
            console.log("Tài xế online nhưng không trong trong trang drive");
            setTimeout(() => {
              let driverAfterAfter = driversOnline.get(socket.userId);

              if (
                driverAfterAfter &&
                drivePageRegex.test(driverAfterAfter.url)
              ) {
                console.log("không xoá cuốc xe");
                return;
              } else {
                console.log("Xoá luôn cuốc xe");
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
            console.log("Tài xế online nhưng trong trang drive");
            return;
          } else {
            console.log("Tài xế đã offline");
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
      //   //Đặt đếm ngược là 10 giây
      //   setTimeout(() => {
      //     //Nếu TRONG 10s mà driver tiếp tục online thì sẽ load lại dữ liệu trước đó của driver
      //     if (driversOnline.get(socket.userId)) {
      //       return;
      //     }
      //     //Nếu TRONG 10s driver KHÔNG quay lại thì
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
      //       //Xoá dữ liệu trong driver store luôn
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
