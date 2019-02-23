const express = require("express"),
  mongoose = require("mongoose"),
  router = express.Router();

router.get("/", (req, res) => {
  console.log("home page");
});

module.exports = router;
