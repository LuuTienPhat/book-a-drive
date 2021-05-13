const express = require("express");
// const mssql = require("mssql");
const router = express.Router();
const cors = require("cors");

// var config = {
//   user: "sa",
//   password: "123",
//   server: "ROG-STRIX\\SQLEXPRESS",
//   database: "TEST",
//   port: 1433,
// };

// const SELECT_ALL_KHACHHANG = "SELECT * FROM KHACHHANG";

// mssql.connect(config, (err) => {
//   if (err) console.log(err);

//   let mssqlRequest = new mssql.Request();

//   mssqlRequest.query("SELECT * FROM KHACHHANG", (err, data) => {
//     if (err) console.log(err);
//     console.log(data);

//     // console.table(data.recordset);
//     console.log(data.recordset);

//     mssql.close();
//   });
// });

var Connection = require("tedious").Connection;
var config = {
  server: "ROG-STRIX\\SQLEXPRESS", //update me
  authentication: {
    type: "default",
    options: {
      userName: "sa", //update me
      password: "123", //update me
      database: "TEST",
    },
  },
};
var connection = new Connection(config);
connection.on("connect", function (err) {
  // If no error, then good to proceed.
  console.log("Connected");
});

connection.connect();

var Request = require("tedious").Request;
var TYPES = require("tedious").TYPES;

function executeStatement() {
  request = new Request("SELECT * FROM KHACHHANG", function (err) {
    if (err) {
      console.log(err);
    }
  });
  var result = "";
  request.on("row", function (columns) {
    columns.forEach(function (column) {
      if (column.value === null) {
        console.log("NULL");
      } else {
        result += column.value + " ";
      }
    });
    console.log(result);
    result = "";
  });

  request.on("done", function (rowCount, more) {
    console.log(rowCount + " rows returned");
  });

  request.on("requestCompleted", function () {
    console.log("done");
  });
  connection.execSql(request);
}

executeStatement();
