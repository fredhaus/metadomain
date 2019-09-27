let express = require("express");
let router = express.Router();
const User = require("../models/user");
let {
  get_epik_data,
  get_gandi_data,
  get_nameCom_data
} = require("../api_calls");

// let test = [
//   { name: "test1", price: 8.99, data: { price: "10.22", currency: "EUR" } },
//   { name: "test2", price: 8.99, data: { price: "10.11", currency: "DOL" } },
//   { name: "test3", price: 8.99, data: { price: "10.11", currency: "DOL" } }
// ];

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Metadomain Search", user: req.user });
});

router.get("/result", function(req, res, next) {
  let domainName = req.query.domainSearch;
  let resultArrAll = [
    get_epik_data(domainName),
    get_gandi_data(domainName),
    get_nameCom_data(domainName)
  ];

  Promise.all(resultArrAll).then(results => {
    res.render("result", { results, domainName });
  });
  let currentSearch = {
    domain: domainName
  };
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { searches: currentSearch } }
  ).then(() => {});
});

module.exports = router;
