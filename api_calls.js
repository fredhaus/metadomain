var axios = require("axios");
const Epik = require("./node_modules/epik.com");

// Gandi _________________________________________________

let get_gandi_data = userInput => {
  const headers = {
    authorization: "Apikey u74Ptic6ozNFCIgPNnHxD5W"
  };

  const options = {
    url: "https://api.gandi.net:443/v5/domain/check?name=" + userInput,
    headers: headers
  };

  return axios.request(options).then(response => {
    let responseObj = {};

    if (response.data.products[0].status === "available") {
      responseObj = {
        name: "gandi",
        data: response.data,
        price: response.data.products[0].prices[0].price_after_taxes,
        available: true
      };
    } else {
      responseObj = {
        name: "gandi // not available",
        data: response.data,
        price: 0,
        available: false
      };
    }
    return responseObj;
  });
};

// nameCom _________________________________________________

let get_nameCom_data = userInput => {
  var dataString = { keyword: userInput };

  var options = {
    url: "https://api.dev.name.com/v4/domains:search",
    method: "POST",
    data: dataString,
    auth: {
      username: "frederikhausburg-test",
      password: "d0b92716021ccb08093631646024c8f9d6b3073d"
    }
  };

  let ctr = 0;

  let axiosCall = () => {
    return axios.request(options).then(response => {
      if (ctr < 3) {
        // try three times, in case of faulty API response
        ctr++;
        if (
          Object.keys(response.data).length !== 0 && //  >>>>>>> not empty
          response.data.results[0].domainName === userInput &&
          response.data.results[0].purchasable === true
        ) {
          // console.log(response.data.results);
          let responseObj = {
            name: "nameCom",
            data: response.data,
            price: response.data.results[0].purchasePrice,
            available: true
          };
          return responseObj;
        } else {
          return axiosCall();
        }
      } else if (
        Object.keys(response.data).length !== 0 && //  >>>>>>> not empty
        response.data.results[0].domainName === userInput &&
        !response.data.results[0].purchasable
      ) {
        return {
          name: "NameCom // not available",
          price: 0.0,
          data: { price: "0.00", currency: "EUR" },
          available: false
        };
      } else {
        return {
          name: "NameCom // Unresponsive",
          price: 0.0,
          data: { price: "0.00", currency: "EUR" },
          available: false
        };
      }
    });
  };
  return axiosCall();
};

// EPIK _________________________________________________

let get_epik_data = async userInput => {
  const EpikClient = new Epik("44F0-B9DB-DEAA-8200");

  return EpikClient.domains.checkAvailability(userInput).then(response => {
    console.log(response.data);

    let responseObj = {};

    if (response.data.details.domain.available === true) {
      responseObj = {
        name: "epik",
        data: response.data,
        price: response.data.details.domain.price,
        available: true
      };
    } else {
      responseObj = {
        name: "epik // not available",
        data: response.data,
        price: 0,
        available: false
      };
    }
    return responseObj;
  });
};

// _________________________________________________

module.exports = {
  get_nameCom_data,
  get_gandi_data,
  get_epik_data
};
