const express = require("express");
const router = express.Router();

router.get("/users", (req, res) => {
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

module.exports = router;
