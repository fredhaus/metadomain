let express = require("express");
const expressip = require("express-ip");
let router = express.Router();
const User = require("../models/user");
let allSearches = [];

var axios = require("axios");
let restCountryAll = require("../misc/restCountryAPI");
let {
  get_gandi_data,
  get_nameCom_data,
  get_namesilo_data,
  oneUSDtoEUR
} = require("../api_calls");

let line = "_____________________________";

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
  if (!req.session.searches) {
    req.session.searches = [];
  }
});

// router.get('/ipinfo', function (req, res) {

// var message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
// res.send(message);
// });

router.get("/result", function(req, res, next) {
  if (!req.session.searches) {
    req.session.searches = [];
  }
<<<<<<< domain-input-verification
  let domainName = req.query.domainSearch;

  // domain input verification >> string.string

  if (domainName.match(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/) === null) {
    let errorMessage = '"' + domainName + '" is not a valid search term. Please try again in the format of domain.ending'
    res.render("index", { domainName, errorMessage });
  } else {
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
    countrySpecificDomain = domainStl + ipSpecificTld;

    let resultArrAll = [
      // get_epik_data(domainName),
      get_gandi_data(domainName),
      get_nameCom_data(domainName),
      get_namesilo_data(domainName),
      // get_epik_data(countrySpecificDomain),
      get_gandi_data(countrySpecificDomain),
      get_nameCom_data(countrySpecificDomain),
      get_namesilo_data(countrySpecificDomain)
    ];

    Promise.all(resultArrAll)
      .then(results => {
        // console.log(JSON.stringify(results))
        console.log(results);

        // cheapest Query Result
        let QueryResult = results.filter(function(obj) {
          return obj.query === domainName;
        });
        // cheapest countrySpecific Result
        let countrySpecificResult = results.filter(function(obj) {
          return obj.query === countrySpecificDomain;
        });

        //Checking availability
        let avaialbleQueryResults = checkAvailabilty(QueryResult);
        let avaialblecountrySpecificResult = checkAvailabilty(
          countrySpecificResult
        );

        // Handling case of unavailability // query
        bestQueryResult = {};
        if (avaialbleQueryResults.length > 0) {
          // Finding cheapest option of potential alternatives
          bestQueryResult = findCheapest(avaialbleQueryResults);
        } else {
          (bestQueryResult.name = "Unavailable"),
            (bestQueryResult.price = "0.00");
        }
        bestCountrySpecificResult = {};
        // Handling case of unavailability // country specific
        if (avaialblecountrySpecificResult.length > 0) {
          // Finding cheapest option of potential alternatives
          bestCountrySpecificResult = findCheapest(
            avaialblecountrySpecificResult
          );
        } else {
          (bestCountrySpecificResult.name = "Unavailable"),
            (bestCountrySpecificResult.price = "0.00");
        }

        // rendering result page
        res.render("result", {
          bestQueryResult,
          bestCountrySpecificResult,
          domainName,
          countrySpecificDomain
        });

        // Saving Search in DB/User
        let currentSearch = {
          domain: domainName,
          price: bestQueryResult.price
        };
        allSearches.push(currentSearch);
        req.session.search = currentSearch;
        req.session.searches = allSearches;

=======

  let domainName = req.query.domainSearch;

  //splitting searched domain by the dot
  let domainNameArr = domainName.split(".");
  let domainStl = domainNameArr[0];

  // IpInfo ________
  const ipInfo = req.ipInfo;
  const ipInfoCountryCode = ipInfo.country;

  // looking up domain ending for IP-Country ________________
  let ipSpecificTld = restCountryAll.find(
    ({ alpha2Code }) => alpha2Code === ipInfoCountryCode
  ).topLevelDomain[0];

  // assembling country/ip-specific new domain
  countrySpecificDomain = domainStl + ipSpecificTld;

  let resultArrAll = [
    oneUSDtoEUR(),
    get_gandi_data(domainName),
    get_nameCom_data(domainName),
    get_namesilo_data(domainName),
    get_gandi_data(countrySpecificDomain),
    get_nameCom_data(countrySpecificDomain),
    get_namesilo_data(countrySpecificDomain)
  ];

  Promise.all(resultArrAll)
    .then(results => {
      console.log(results)

      // convert NameCom & namesilo USD to EUR

      results.forEach(element => {
        if (element.name === "nameCom" || element.name == "namesilo") {
          newPrice = (element.price * results[0]).toFixed(2); // EUR price * USDtoEUR
          newPriceInt = parseFloat(newPrice);
          element.price = newPriceInt;
        }
      });

      // console.log(results)

      // cheapest Query Result
      let QueryResult = results.filter(function(obj) {
        return obj.query === domainName;
      });
      // cheapest countrySpecific Result
      let countrySpecificResult = results.filter(function(obj) {
        return obj.query === countrySpecificDomain;
      });

      //Checking availability
      let avaialbleQueryResults = checkAvailabilty(QueryResult);
      let avaialblecountrySpecificResult = checkAvailabilty(
        countrySpecificResult
      );

      // Handling case of unavailability // query
      bestQueryResult = {};
      if (avaialbleQueryResults.length > 0) {
        // Finding cheapest option of potential alternatives
        bestQueryResult = findCheapest(avaialbleQueryResults);
      } else {
        (bestQueryResult.name = "Unavailable"),
          (bestQueryResult.price = "0.00");
      }
      bestCountrySpecificResult = {};
      // Handling case of unavailability // country specific
      if (avaialblecountrySpecificResult.length > 0) {
        // Finding cheapest option of potential alternatives
        bestCountrySpecificResult = findCheapest(
          avaialblecountrySpecificResult
        );
      } else {
        (bestCountrySpecificResult.name = "Unavailable"),
          (bestCountrySpecificResult.price = "0.00");
      }

      // rendering result page
      res.render("result", {
        bestQueryResult,
        bestCountrySpecificResult,
        domainName,
        countrySpecificDomain,
      });

      // Saving Search in DB/User

      let today = new Date();
      let date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      let time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let timestamp = Date.now();

      let currentSearch = {
        domain: domainName,
        price: bestQueryResult.price,
        host: bestQueryResult.name,
        available: bestQueryResult.available,
        timestamp: timestamp,
        SearchDate: date,
        SearchTime: time
      };

      // console.log(currentSearch)
      allSearches.push(currentSearch);
      req.session.search = currentSearch;
      req.session.searches = allSearches;

      console.log(currentSearch);

      User.findOneAndUpdate(
        { _id: "5d9b74d814bc26842ae2ce99" }, // adminID - needs to be set up on database once// p4$$w0rd
        { $push: { searches: currentSearch } }
      ).then(result => {
        console.log("saved in admin search");
      });

      if (req.user) {
>>>>>>> master
        return User.findOneAndUpdate(
          { _id: req.user._id },
          { $push: { searches: currentSearch } }
        );
<<<<<<< domain-input-verification
      })
      .then(result => {
        console.log("Saved successfully");
      })
      .catch(error => {
        console.log(error);
      });
  }
=======
      }
    })
    .then(result => {
      console.log("Saved successfully");
    })
    .catch(error => {
      console.log(error);
    });
>>>>>>> master
});

module.exports = router;
