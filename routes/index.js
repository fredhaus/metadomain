let express = require("express");
let router = express.Router();
const User = require("../models/user");
function findCheapest(domainObjects) {
  let objectNumber = 0;
  let cheapestPrice = domainObjects[objectNumber].price;
  for (let counter = 1; counter < domainObjects.length; counter++) {
    if (domainObjects[counter].price < cheapestPrice) {
      cheapestPrice = domainObjects[counter].price;
      objectNumber = counter;
    } else {
    }
  }
  return domainObjects[objectNumber];
}
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
  Promise.all(resultArrAll)
    .then(results => {
      let bestResult = findCheapest(results);
      res.render("result", { bestResult, domainName });
      let currentSearch = {
        domain: domainName,
        price: bestResult.price
      };
      req.session.search = currentSearch;
      return User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { searches: currentSearch } }
      );
    })
    .then(result => {
      console.log("Saved successfully");
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = router;
