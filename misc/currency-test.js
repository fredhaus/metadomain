//https://api.exchangeratesapi.io/latest?base=USD
const axios = require("axios");

let USD_to_EUR = () => {
  const options = {
    url: "https://api.exchangeratesapi.io/latest?base=USD"
  };

  return axios.request(options).then(response => {
    let conversionRate = response.data.rates.EUR;
    conversionString = (conversionRate).toFixed(2);
    conversionInt = parseFloat(conversionString);
    
    return conversionInt

  });
};

let test = () => {
  console.log("dies das")
  USD_to_EUR().then(result => {
    console.log(result)
  })
}

test()




// var conversionInt = 0
// async function USD_to_EUR () {
//   const options = {
//     url: "https://api.exchangeratesapi.io/latest?base=USD"
//   };

//   let oneUsdToEur = await axios.request(options).data.rates.EUR;
//   console.log(oneUsdToEur)
  
// };

// USD_to_EUR()


// async function moin () {
//   let junge = {
//     price: await USD_to_EUR(10)
//   }
//   console.log(junge)
// };

// moin()
