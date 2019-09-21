// let secrets = require("./api_secrets/api_secrets");
// console.log(secrets.nameCom);

//___________



var axios = require("axios");
const Epik = require("./node_modules/epik.com");

let get_gandi_data = userInput => {
  const headers = {
    authorization: "Apikey u74Ptic6ozNFCIgPNnHxD5W"
  };

  const options = {
    url: "https://api.gandi.net:443/v5/domain/check?name=" + userInput,
    headers: headers
  };

  return axios.request(options).then(response => {
    // console.log("GANDI______________________")
    // console.log(response.data);
    // console.log("______________________")
    let responseObj = {
      name: "gandi",
      data: response.data, 
      price: response.data.products[0].prices[0].price_after_taxes
    };

    return responseObj;
  });
};

let get_nameCom_data = userInput => {
  var dataString = { keyword: "thedopestdomainever.com" };

  var options = {
    url: "https://api.dev.name.com/v4/domains:search",
    method: "POST",
    data: dataString,
    auth: {
      username: "frederikhausburg-test",
      password: "d0b92716021ccb08093631646024c8f9d6b3073d"
    }
  };

  return axios.request(options).then(response => {
    // console.log("nameCom______________________")
    // console.log(response.data);
    // console.log("______________________")
    let responseObj = {
      name: "nameCom",
      data: response.data,
      price: response.data.results[0].purchasePrice
    };

    return responseObj;
  });
};

let get_epik_data = async userInput => {
  //2. Initiate the Epik API Client with your API Signature
  const EpikClient = new Epik("44F0-B9DB-DEAA-8200");

  return EpikClient.domains.checkAvailability(userInput).then(response => {
    // console.log("Epik______________________")
    // console.log(response.data);
    // console.log("______________________")
    let responseObj = {
      name: "epik",
      data: response.data,
      price: response.data.details.domain.price
    };
    return responseObj;
  });
};

module.exports = {
  get_nameCom_data,
  get_gandi_data,
  get_epik_data
};

// module.exports = get_epik_data

// testing_________________

// console.log("TEST geht los");
// get_nameCom_data("mooooooooooooin.com");
// get_gandi_data("mooooooooooooin.com");
// get_epik_data("mooooooooooooin.com");

//______ Hendik TA Advice, how to execute in different file

// get_epik_data("mooooooooooooin.com").then(response){
//   response.//do something
// }

// let resultArrAll =[
//   get_epik_data("mooooooooooooin.com"),get_epik_data("mooooooooooooin.com"),get_epik_data("mooooooooooooin.com")
// ]

// Promise.all(resultArrAll).then(results => {
//   // results = Array mit den Ergebnissen, in der gleichen Reihenfolge wie Promsises reingeben.
//   resukts.sort((a, b) => {

//   })
// });
