var axios = require("axios");
require("dotenv").config();
const Epik = require("./node_modules/epik.com");
const NameSilo = require("namesilo-domain-api");
const request = require("request-promise");
const fixieRequest = request.defaults({ proxy: process.env.FIXIE_URL });

// Currency Conversion

let oneUSDtoEUR = () => {
  const options = {
    url: "https://api.exchangeratesapi.io/latest?base=USD"
  };

  return axios
    .request(options)
    .then(response => {
      let conversionRate = response.data.rates.EUR;
      return conversionRate;
    })
    .catch(err => {});
};

// Gandi _________________________________________________

let get_gandi_data = userInput => {
  const headers = {
    authorization: "Apikey " + process.env.GANDI
  };

  const options = {
    url: "https://api.gandi.net:443/v5/domain/check?name=" + userInput,
    headers: headers
  };

  return axios
    .request(options)
    .then(response => {
      let responseObj = {};

      if (response.data.products[0].status === "available") {
        let endingArr = userInput.split(".");
        responseObj = {
          query: userInput,
          ending: "." + endingArr[1],
          stl: endingArr[0],
          name: "gandi",
          data: response.data,
          price: response.data.products[0].prices[0].price_after_taxes,
          available: true,
          availableHB: true,
          redirectURL:
            "https://shop.gandi.net/en/domain/suggest?search=" + userInput
        };
      } else {
        responseObj = {
          query: userInput,
          name: "gandi // not available",
          data: response.data,
          price: 999999,
          available: false
        };
      }
      return responseObj;
    })
    .catch(err => {
      // console.error(err);
      console.log("# __________________ Namesilo not availalbe/responsive");
    });
};

// nameCom _________________________________________________

let get_nameCom_data = userInput => {
  var dataString = { domainNames: [userInput] };

  var options = {
    url: "https://api.name.com/v4/domains:checkAvailability",
    method: "POST",
    data: dataString,
    auth: {
      username: process.env.NAMECOMUSER,
      password: process.env.NAMECOMPW
    }
  };

  let ctr = 0;

  let axiosCall = () => {
    return axios
      .request(options)
      .then(response => {
        if (ctr < 3) {
          // try three times, in case of faulty API response
          ctr++;
          if (
            Object.keys(response.data).length !== 0 && //  >>>>>>> not empty
            response.data.results[0].domainName === userInput &&
            response.data.results[0].purchasable === true
          ) {
            let endingArr = userInput.split(".");
            let responseObj = {
              query: userInput,
              ending: "." + endingArr[1],
              stl: endingArr[0],
              name: "nameCom",
              data: response.data,
              price: response.data.results[0].purchasePrice,
              available: true,
              availableHB: true,
              redirectURL: "https://www.name.com/domain/search/" + userInput
            };
            return responseObj;
          } else {
            return axiosCall();
          }
        } else if (
          // not availble
          Object.keys(response.data).length !== 0 && //  >>>>>>> not empty
          response.data.results[0].domainName === userInput &&
          !response.data.results[0].purchasable
        ) {
          return {
            query: userInput,
            name: "NameCom // not available",
            price: 999999,
            data: { price: "0.00", currency: "EUR" },
            available: false
          };
        } else {
          return {
            query: userInput,
            name: "NameCom // Unresponsive",
            price: 999999,
            data: { price: "0.00", currency: "EUR" },
            available: false
          };
        }
      })
      .catch(err => {
        // console.error(err);
        console.log("# __________________ Namesilo not availalbe/responsive");
      });
  };
  return axiosCall();
  // });
};

let get_namesilo_data = userInput => {
  let ns = new NameSilo(process.env.NAMESILO);
  let responseObj = {};

  return ns
    .checkRegisterAvailability([userInput])
    .then(resp => {
      if (resp.available) {
        let endingArr = userInput.split(".");
        return (responseObj = {
          query: userInput,
          ending: "." + endingArr[1],
          stl: endingArr[0],
          name: "namesilo",
          price: parseFloat(resp.available.domain.price), //resp.available.domain.price,
          data: resp,
          available: true,
          availableHB: true,
          redirectURL: "https://www.namesilo.com/register.php?rid=65d8839p"
        });
      } else {
        return (responseObj = {
          query: userInput,
          name: "namesilo // not available",
          data: resp,
          price: 999999,
          available: false
        });
      }
    })
    .catch(err => {
      // console.error(err);
      console.log("# __________________ Namesilo not availalbe/responsive");
    });
  // });
};

module.exports = {
  get_nameCom_data,
  get_gandi_data,
  get_namesilo_data,
  oneUSDtoEUR
};

// EPIK _________________________________________________
// let get_epik_data = userInput => {
//   var headers = {
//     accept: "application/json",
//     "content-type": "application/json"
//   };

//   var options = {
//     url:
//       "https://usersapiv2.epik.com/v2/domains/check?SIGNATURE=" +
//       process.env.EPIK +
//       "&DOMAINS=" +
//       userInput,
//     headers: headers
//   };

//   let userInputUpperCase = userInput.toUpperCase();

//   return fixieRequest(options.url).then(response => {

//     // console.log(response)
//     // console.log(JSON.parse(response))
//     // console.log(JSON.parse(response).data[userInputUpperCase])
//     // console.log("_______________")

//     let responseObj = {};
//     if (JSON.parse(response).data[userInputUpperCase].available === 1) {
//       return responseObj = {
//         query: userInput,
//         name: "Epik",
//         price: JSON.parse(response).data[userInputUpperCase].price,
//         data: JSON.parse(response).data,
//         available: true
//       };
//     } else {
//       return responseObj = {
//         query: userInput,
//         name: "Epik // not available",
//         price: 99999,
//         data: JSON.parse(response).data,
//         available: false
//       };
//     }

//   });
// };

// let get_epik_data = async userInput => {
//   const EpikClient = new Epik(process.env.EPIK);

//   return EpikClient.domains.checkAvailability(userInput).then(response => {
//     let responseObj = {};

//     if (response.data.details.domain.available === true) {
//       responseObj = {
//         query: userInput,
//         name: "epik",
//         data: response.data,
//         price: response.data.details.domain.price,
//         available: true
//       };
//     } else {
//       responseObj = {
//         query: userInput,
//         name: "epik // not available",
//         data: response.data,
//         price: 999999,
//         available: false
//       };
//     }
//     return responseObj;
//   });
// };

// _________________________________________________

// let find_alt_domains = domainSTL => {
//   //to be continued

//   // get nameCom overview
//   var dataString = { keyword: domainSTL };

//   var options = {
//     url: "https://api.dev.name.com/v4/domains:search",
//     method: "POST",
//     data: dataString,
//     auth: {
//       username: "frederikhausburg-test",
//       password: "d0b92716021ccb08093631646024c8f9d6b3073d"
//     }
//   };

//   return axios.request(options).then(response => {
//     responseArr = response.data.results;
//     availArr = {};
//     responseArr.forEach(element => {
//       // console.log(element)
//       // console.log("__________")
//       // console.log(element.domainName)
//       // console.log("__________")
//       if (element.purchasable === true) {
//         console.log(element.domainName);
//         console.log("__________");
//       }
//       // if(element.purchasable === true){
//       //   console.log(element)
//       // }
//     });
//     // console.log(response.data.results);
//   });

//   // get epik altertatives with post array
//   // get gandi individual cheap domains
// };
