let express = require("express");
const expressip = require("express-ip");
let router = express.Router();
const User = require("../models/user");
let allSearches = [];
const _ = require("lodash");

var axios = require("axios");
let restCountryAll = require("../misc/restCountryAPI");
let {
  get_gandi_data,
  get_nameCom_data,
  get_namesilo_data,
  oneUSDtoEUR
} = require("../api_calls");

let line = "_____________________________";

let trends = [".top", ".org", ".net", ".io", ".site", ".co" ,".xyz", ".online"];

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
  if (!req.session.searches) {
    req.session.searches = [];
  }
  req.session.save(function() {
    res.render("index", { user: req.user });
  });
});

router.get("/trends", function(req, res, next) {
  let coreTrendName = req.query.domain;
  let domainNameArrTrend = coreTrendName.split(".");
  let domainStlTrend = domainNameArrTrend[0];
  let trendResultsAll = [];
  oneUSDtoEUR();
  trends.forEach(trend => {
    trendResultsAll.push(get_gandi_data(domainStlTrend + trend));
    trendResultsAll.push(get_nameCom_data(domainStlTrend + trend));
    trendResultsAll.push(get_namesilo_data(domainStlTrend + trend));
  });
  Promise.all(trendResultsAll)
    .then(results => {
      // console.log(results)
      oneUSDtoEUR().then(rate => {
        results.forEach(element => {
          if (element.name === "nameCom" || element.name == "namesilo") {
            newPrice = (element.price * rate).toFixed(2); // EUR price * USDtoEUR
            newPriceInt = parseFloat(newPrice);
            
            if(newPriceInt.toString().length){
              newPriceInt = newPriceInt.toFixed(2)
            }
            element.price = newPriceInt;
          }
        });

        let sorted = [];

        for (let index = 0; index < trends.length; index++) {
          const trendsEnding = trends[index];

          let tempResults = [];
          results.forEach(element => {
            if (element.ending === trendsEnding) {
              // own temp array for each ending
              tempResults.push(element);
            }
          });
          let tempSorted = _.sortBy(tempResults, ["price"]);
          sorted.push(tempSorted[0]);
        }

        sorted = _.sortBy(sorted, ["price"]);

        res.render("trends", { user: req.user, sorted, layout: false });
      });
    })
    .catch(err => {
      console.log(err);
    });
});

// router.get('/ipinfo', function (req, res) {

// var message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
// res.send(message);
// });

router.get("/result", function(req, res, next) {
  if (!req.session.searches) {
    req.session.searches = [];
  }
  let domainName = req.query.domainSearch;

  // domain input verification >> string.string

  if (domainName.match(/^[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/) === null) {
    let errorMessage =
      '"' +
      domainName +
      '" is not a valid search term. Please try again in the format of domain.ending';
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
        // console.log(JSON.stringify(results))
        console.log(results);

        results.forEach(element => {
          if (element.name === "nameCom" || element.name == "namesilo") {
            newPrice = (element.price * results[0]).toFixed(2); // EUR price * USDtoEUR
            newPriceInt = parseFloat(newPrice);
            element.price = newPriceInt;
          }
        });

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
          domainStl: domainStl,
          bestDomainTld: domainNameArr[1],
          ipSpecificTld: ipSpecificTld,
          bestQueryResult: bestQueryResult,
          bestCountrySpecificResult: bestCountrySpecificResult,
          domainName: domainName,
          countrySpecificDomain: countrySpecificDomain,
          user: req.user
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
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        let timestamp = Date.now();

        let currentSearch = {
          domain: domainName,
          ending: bestQueryResult.ending,
          redirectURL: bestQueryResult.redirectURL,
          price: bestQueryResult.price,
          host: bestQueryResult.name,
          available: bestQueryResult.available,
          timestamp: timestamp,
          SearchDate: date,
          SearchTime: time
        };

        req.session.search = currentSearch;
        req.session.searches.push(currentSearch)

        req.session.save();

        User.findOneAndUpdate(
          { email: "admin@istrator.com" }, // adminID - needs to be set up on database once// p4$$w0rd
          { $push: { searches: currentSearch } }
        ).then(result => {
          console.log("saved in admin search");
        });

        if (req.user) {
          return User.findOneAndUpdate(
            { _id: req.user._id },
            { $push: { searches: currentSearch } }
          );
        }
      })
      .then(result => {
        console.log("Saved successfully");
      })
      .catch(error => {
        console.log(error);
      });
  }
});

module.exports = router;
