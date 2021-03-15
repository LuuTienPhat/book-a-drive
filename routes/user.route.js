const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const cors = require("cors");

router.use(cors());

const SELECT_ALL_USERS_QUERY = "SELECT * FROM USERS";
const connection = mysql.createConnection({
  host: "sql6.freesqldatabase.com",
  user: "sql6397235",
  password: "UUAis664X3",
  database: "sql6397235",
});

connection.connect((err) => {
  if (err) {
    console.log("error connecting: " + err.stack);
    return;
  } else {
    console.log("Connect succesfully!");
  }
});

router.get("/", (req, res) => {
  connection.query(SELECT_ALL_USERS_QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.json({
        data: results,
      });
    }
  });
});

router.get("/send", (req, res) => {
  res.send("Hello");
  // console.log(req);
});

router.post("/send", (req, res) => {
  console.log(req.body);
});

router.get("/add", (req, res) => {
  const { username, password } = req.query;
  const INSERT_USER_QUERY = `INSERT INTO USERS VALUES ('${username}', '${password}')`;
  connection.query(INSERT_USER_QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      res.redirect("/");
    }
  });
});

module.exports = router;
