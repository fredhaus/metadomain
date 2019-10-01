let express = require("express");
let router = express.Router();
const User = require("../models/user");

var axios = require("axios");
let restCountryAll = require("../misc/restCountryAPI");
let {
  get_epik_data,
  get_gandi_data,
  get_nameCom_data,
  find_alt_domains
} = require("../api_calls");

let line = "_____________________________"

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


/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Metadomain Search", user: req.user });
});

// router.get('/ipinfo', function (req, res) {

//   const ipInfo = req.ipInfo;
//   console.log("Current User is located in " + ipInfo.country, "City: " + ipInfo.city)
// var message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
// res.send(message);
// });

router.get("/result", function(req, res, next) {
  let domainName = req.query.domainSearch;

  //splitting searched domain by the dot
  let domainNameArr = domainName.split(".");
  let domainStl = domainNameArr[0];

  // IpInfo ________
  const ipInfo = req.ipInfo;
  const ipInfoCountryCode = ipInfo.country;
  // console.log("Current User is located in " + ipInfo.country, "City: " + ipInfo.city)
  
  // looking up domain ending for IP-Country ________________
  let ipSpecificTld = restCountryAll.find(
    ({ alpha2Code }) => alpha2Code === ipInfoCountryCode
  ).topLevelDomain[0];

  // assembling country/ip-specific new domain
  countrySpecificDomain = domainStl + ipSpecificTld
  
  let resultArrAll = [
    get_epik_data(domainName),
    get_gandi_data(domainName),
    get_nameCom_data(domainName),
    get_epik_data(countrySpecificDomain),
    get_gandi_data(countrySpecificDomain),
    get_nameCom_data(countrySpecificDomain)
  ];

  Promise.all(resultArrAll)
    .then(results => {

      // cheapest Query Result
      let QueryResult = results.filter(function( obj ) {
        return obj.query === domainName
    })
      // cheapest countrySpecific Result
      let countrySpecificResult = results.filter(function( obj ) {
        return obj.query === countrySpecificDomain
    })
      
      //Checking availability
      let avaialbleQueryResults = checkAvailabilty(QueryResult);
      let avaialblecountrySpecificResult = checkAvailabilty(countrySpecificResult);

      // Handling case of unavailability // query
      if (avaialbleQueryResults.length > 0) {
        // Finding cheapest option of potential alternatives
        bestQueryResult = findCheapest(avaialbleQueryResults);
      } else {
        (bestQueryResult.name = "Unavailable"), (bestQueryResult.price = "0.00");
      }

      // Handling case of unavailability // country specific
      if (avaialblecountrySpecificResult.length > 0) {
        // Finding cheapest option of potential alternatives
        bestCountrySpecificResult = findCheapest(avaialblecountrySpecificResult);
      } else {
        (bestCountrySpecificResult.name = "Unavailable"), (bestCountrySpecificResult.price = "0.00");
      }      

      // rendering result page
      res.render("result", { bestQueryResult, bestCountrySpecificResult, domainName, countrySpecificDomain});

      // Saving Search in DB/User
      let currentSearch = {
        domain: domainName,
        price: bestQueryResult.price
      };
      req.session.search = currentSearch;
      document.cookie = "searches=" + currentSearch; ////////////////////////////////////////
      console.log(document.cookie);
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
