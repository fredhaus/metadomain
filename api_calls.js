var axios = require("axios");
const Epik = require("./node_modules/epik.com");
const NameSilo = require('namesilo-domain-api')
const secrets = require('./api_secrets/api_secrets')

// Gandi _________________________________________________

let get_gandi_data = userInput => {
  const headers = {
    authorization: "Apikey " + secrets.gandi
  };

  const options = {
    url: "https://api.gandi.net:443/v5/domain/check?name=" + userInput,
    headers: headers
  };

  return axios.request(options).then(response => {
    let responseObj = {};

    if (response.data.products[0].status === "available") {
      responseObj = {
        query: userInput,
        name: "gandi",
        data: response.data,
        price: response.data.products[0].prices[0].price_after_taxes,
        available: true
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
      username: secrets.nameComUser,
      password: secrets.nameComPW
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
            query: userInput,
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
    });
  };
  return axiosCall();
};

// EPIK _________________________________________________

let get_epik_data = async userInput => {
  const EpikClient = new Epik(secrets.epik);

  return EpikClient.domains.checkAvailability(userInput).then(response => {
    let responseObj = {};

    if (response.data.details.domain.available === true) {
      responseObj = {
        query: userInput,
        name: "epik",
        data: response.data,
        price: response.data.details.domain.price,
        available: true
      };
    } else {
      responseObj = {
        query: userInput,
        name: "epik // not available",
        data: response.data,
        price: 999999,
        available: false
      };
    }
    return responseObj;
  });
};

// _________________________________________________

let get_namesilo_data = userInput =>{

  let ns = new NameSilo(secrets.namesilo)
  let responseObj = {}

  return ns.checkRegisterAvailability([userInput]).then(resp=>{
    if(resp.available){
      responseObj = {
        query: userInput,
        name: "namesilo",
        price: resp.available.domain.price,
        data: resp,
        available: true
        }
        

      } 
    else {
      responseObj = {
        query: userInput,
        name: "namesilo // not available",
        data: resp,
        price: 999999,
        available: false
        }
      }

  }).catch(err=>{
    console.error(err)
  })

}

let find_alt_domains = domainSTL => { //to be continued
  
  // get nameCom overview
  var dataString = { keyword: domainSTL };

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


    responseArr = response.data.results
    availArr = {}
    responseArr.forEach(element => {
      // console.log(element)
      // console.log("__________")
      // console.log(element.domainName)
      // console.log("__________")
      if(element.purchasable === true){
        console.log(element.domainName)
        console.log("__________")
      }
      // if(element.purchasable === true){
      //   console.log(element)
      // }
    });
    // console.log(response.data.results);
  
  });

  // get epik altertatives with post array
  // get gandi individual cheap domains
};

module.exports = {
  get_nameCom_data,
  get_gandi_data,
  get_epik_data,
  find_alt_domains,
  get_namesilo_data
};
