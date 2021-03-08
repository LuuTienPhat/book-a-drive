const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const { query } = require("express");
const app = express();
const port = 3000;

app.use(cors());

const SELECT_ALL_USERS_QUERY = "SELECT * FROM USERS";
const connection = mysql.createConnection({
  host: "sql6.freesqldatabase.com",
  user: "sql6397235",
  password: "UUAis664X3",
  database: "sql6397235",
});
app.get("/", (req, res) => {
  res.send("Hello Word!");
});

app.get("/users", (req, res) => {
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

app.get("/users/add", (req, res) => {
  const { username, password } = req.query;
  const INSERT_USER_QUERY = `INSERT INTO USERS VALUES ('${username}', '${password}')`;
  connection.query(INSERT_USER_QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      res.redirect("/users");
    }
  });
});

connection.connect((err) => {
  if (err) {
    console.log("error connecting: " + err.stack);
    return;
  }
});
// console.log(connection);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
