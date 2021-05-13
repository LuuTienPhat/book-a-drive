const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const customerRoute = require("./routes/customer.route");
const engine = require("ejs-mate");
const driverRoute = require("./routes/driver.route");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const mssql = require("mssql");
const config = require("./sqlConfig");
const axios = require("axios");
const URL = require("url");

let customersOnline = [];
let driversOnline = [];
let rooms = new Map();
let driveRooms = new Map();

app.engine("ejs", engine);
app.set("views", "./views");
app.set("view-engine", "ejs");

const setSocketByCookie = (userId, array, socket) => {
  const result = array.find((driver) => {
    return driver.userId == userId;
  });

  if (!result) {
    array.push({
      userId: userId,
      // socketId: socket.id
    });
    socket.userId = userId;
    // socket.join(socket.id);
    socket.emit("SET_ID", socket.userId);
  } else {
    socket.userId = result.userId;
    // socket.id = result.socketId;
    // socket.join(socket.id);
    socket.emit("SET_ID", socket.userId);
  }
};

io.on("connection", async (socket) => {
  // socket.leave(socket.id);
  var cookief = socket.request.headers.cookie;
  var cookies = cookie.parse(cookief);
  let userId;

  if (cookies.token) {
    jwt.verify(cookies.token, "tx", (error, decoded) => {
      if (error) {
        return;
      } else {
        userId = decoded.id;
        setSocketByCookie(userId, driversOnline, socket);
      }
    });

    jwt.verify(cookies.token, "kh", (error, decoded) => {
      if (error) {
        return;
      } else {
        userId = decoded.id;
        setSocketByCookie(userId, customersOnline, socket);
      }
    });
  }
  // console.log(driversOnline);
  console.log(socket.adapter.rooms);
  console.log(socket.id + " is online");
  console.log(socket.userId + " is online");
  // console.log(socket);

  // var room = socket.adapter.rooms.get(socket.id).size;
  console.log("DANH SACH PHONG", rooms);
  // console.log(room.size);

  // socket.on("connect_error", () => {
  //   console.log("There is error");
  // });

  socket.on("UPDATE_LIST", () => {
    socket.broadcast.emit("RENDER_LIST");
  });

  socket.on("DRIVER_IS_WATCHING", (driveId) => {
    if (rooms.get(driveId) === undefined) {
      io.to(socket.id).emit("DRIVE_NO_LONGER_EXIST");
      return;
    }
    let { drivers, customer, detail } = rooms.get(driveId);
    drivers = drivers.add(socket.id);
    rooms.set(driveId, { drivers, customer, detail });
    console.log("DANH SACH PHONG", rooms);
  });

  socket.on("DRIVER_IS_NOT_WATCHING", (driveId) => {
    console.log("driver is not watching");
    if (rooms.get(driveId) === undefined) {
      io.to(socket.id).emit("DRIVE_NO_LONGER_EXIST");
      return;
    }
    let { drivers, customer, detail } = rooms.get(driveId);
    drivers = drivers.delete(socket.id);
    rooms.set(driveId, { drivers, customer, detail });
    console.log("DANH SACH PHONG", rooms);
  });

  socket.on("SEARCH_FOR_DRIVER", (driveId) => {
    axios
      .get(`http://localhost:3001/list/${driveId}`)
      .then((res) => res.data)
      .then((data) => {
        rooms.set(driveId, {
          drivers: new Set(),
          customer: socket.id,
          detail: data,
        });
      })
      .catch((err) => console.log(err));
  });

  socket.on("STOP_SEARCH", (driveId) => {
    if (rooms.get(driveId) === undefined) {
      socket.emit("DRIVE_NO_LONGER_EXIST");
      return;
    }

    axios.delete(`http://localhost:3001/list/${driveId}`);
    let { drivers, customer, detail } = rooms.get(driveId);
    for (const value of drivers) {
      drivers.delete(value);
      io.to(value).emit("DRIVE_NO_LONGER_EXIST");
    }
    rooms.set(driveId, { drivers, customer, detail });
  });

  socket.on("FINISH", (driveId) => {
    if (rooms.get(driveId) === undefined) {
      socket.emit("DRIVE_NO_LONGER_EXIST");
      return;
    }

    let { drivers, customer, detail } = rooms.get(driveId);
    detail.MATX = socket.userId;
    axios
      .post(`http://localhost:3001/drives/`, detail)
      .catch((err) => console.error(err));

    axios
      .delete(`http://localhost:3001/list/${driveId}`)
      .catch((err) => console.error(err));
  });

  socket.on("DRIVER_HAS_CHOSEN", (data) => {
    const { driveId, driverId, driverLocation } = data;
    if (rooms.get(driveId) === undefined) {
      socket.emit("DRIVE_NO_LONGER_EXIST");
      return;
    }

    let { drivers, customer, detail } = rooms.get(driveId);
    for (const value of drivers) {
      if (value !== socket.id) {
        drivers.delete(value);
        io.to(value).emit("DRIVE_NO_LONGER_EXIST");
      } else {
        // console.log(socket.userId);
        detail.MATX = socket.userId;
        rooms.set(driveId, { drivers, customer, detail });
        // console.log(value);
        socket.to(customer).emit("DRIVER_ON_THE_WAY", data);
        console.log(rooms);
      }
    }

    // detail.MATX = driveId;
    // socket.join(driveId);
    // console.log(socket.adapter.rooms);
    // console.log(rooms.get(driveId).drivers[0]);
    // socket.to(rooms.get(driveId).drivers[0]).emit("DRIVER_ON_THE_WAY", data);
  });

  socket.on("disconnect", () => {
    console.log(socket.userId + " is leaving");
    for (let [key, value] of rooms) {
      let { drivers, customer, detail } = value;
      drivers.delete(socket.id);
      rooms.set(key, { drivers, customer, detail });
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

app.use("/driver", driverRoute);

app.use("/customer", customerRoute);

app.get("*", function (req, res) {
  res.render("NotFound.ejs", {
    title: "Not Found",
  });
});

server.listen(process.env.PORT || port);
console.log(`Example app listening at http://localhost:${port}`);
