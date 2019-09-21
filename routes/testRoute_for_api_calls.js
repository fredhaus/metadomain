const util = require('util')

let { get_epik_data, get_gandi_data, get_nameCom_data } = require("../api_calls");

let result_epik = get_epik_data("diesdasjenes.com").then((result)=>{
  
  // console.log(util.inspect(result, {showHidden: false, depth: null}))
  console.log(result)
  console.log("_________________________________________________________")
})

let result_gandi = get_gandi_data("diesdasjenes.com").then((result)=>{
  
  // console.log(util.inspect(result, {showHidden: false, depth: null}))
  console.log(result)
  console.log("_________________________________________________________")
})

let result_nameCom = get_nameCom_data("diesdasjenes.com").then((result)=>{
  
  // console.log(util.inspect(result, {showHidden: false, depth: null}))
  console.log(result)
  console.log("_________________________________________________________")
})



