let express = require("express");
let router = express.Router();
const User = require("../models/user");
var axios = require("axios");
let restCountryAll = require("../misc/restCountryAPI");
let {
  get_epik_data,
  get_gandi_data,
  get_nameCom_data,
  find_alt_domains, 
  get_namesilo_data
} = require("../api_calls");

let line = "_____________________________"

// console.log(restCountryAll[0])

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

// let test = [
//   { name: "test1", price: 8.99, data: { price: "10.22", currency: "EUR" } },
//   { name: "test2", price: 8.99, data: { price: "10.11", currency: "DOL" } },
//   { name: "test3", price: 8.99, data: { price: "10.11", currency: "DOL" } }
// ];

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
    get_namesilo_data(domainName),
    get_epik_data(countrySpecificDomain),
    get_gandi_data(countrySpecificDomain),
    get_nameCom_data(countrySpecificDomain),
    get_nameCom_data(countrySpecificDomain)
    
  ];

  Promise.all(resultArrAll)
    .then(results => {

      // cheapest Query Result
      let QueryResult = results.filter(function( obj ) {
        return obj.query === domainName
    })
      let bestResult = findCheapest(QueryResult);

      // cheapest countrySpecific Result
      let countrySpecificResult = results.filter(function( obj ) {
        return obj.query === countrySpecificDomain
    })
      let bestcountrySpecificResult = findCheapest(countrySpecificResult);

      // rendering result page
      res.render("result", { bestResult, bestcountrySpecificResult, domainName, countrySpecificDomain});

      // Saving Search in DB/User
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
