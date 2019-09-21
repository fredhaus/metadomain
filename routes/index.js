var express = require("express");
var router = express.Router();

let test = [
  { name: "test1", price: 8.99, data: { price: "10.22", currency: "EUR" } },
  { name: "test2", price: 8.99, data: { price: "10.11", currency: "DOL" } },
  { name: "test3", price: 8.99, data: { price: "10.11", currency: "DOL" } }
];

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Metadomain Search" });
});

router.get("/result", function(req, res, next) {
  let domainName = req.query.domainSearch;
  //res.json({ test, domainName });
  res.render("result", { test, domainName });
});

module.exports = router;
