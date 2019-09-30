let express = require("express");
let router = express.Router();
const User = require("../models/user");
let allSearches = [];
// Function gets array of objects as input (available suppliers) and compares their prices.
// Then returns object of the cheapest supplier.
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
// Function gets array of API results (as objects) and checks whether they are marked as available.
// Then returns a new array of objects only with available suppliers.
function checkAvailabilty(domainObjects) {
  let availabilityDomains = [];
  domainObjects.forEach(element => {
    if (element.available === true) {
      availabilityDomains.push(element);
    }
  });
  return availabilityDomains;
}
let {
  get_epik_data,
  get_gandi_data,
  get_nameCom_data
} = require("../api_calls");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Metadomain Search", user: req.user });
});

router.get("/result", function(req, res, next) {
  let domainName = req.query.domainSearch;
  let resultArrAll = [
    //get_epik_data(domainName),
    get_gandi_data(domainName),
    get_nameCom_data(domainName)
  ];
  Promise.all(resultArrAll)
    .then(results => {
      //Checking availability
      let avaialbleResults = checkAvailabilty(results);
      // Handling case of unavailability
      let bestResult = {};
      if (avaialbleResults.length > 0) {
        // Finding cheapest option of potential alternatives
        bestResult = findCheapest(avaialbleResults);
      } else {
        (bestResult.name = "Unavailable"), (bestResult.price = "0.00");
      }
      res.render("result", { bestResult, domainName });
      let currentSearch = {
        domain: domainName,
        price: bestResult.price
      };
      allSearches.push(currentSearch);
      req.session.search = currentSearch;
      req.session.searches = allSearches;
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
