const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  // #swagger.ignore = true
  res.render("index", { title: "Express" });
});

module.exports = router;
