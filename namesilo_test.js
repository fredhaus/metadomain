const NameSilo = require('namesilo-domain-api')

let ns = new NameSilo('a82f22405f63e4540889a122')

ns.checkRegisterAvailability(["moooooooooin.com"]).then(resp=>{
  // console.dir(resp.available)
  console.dir(resp)
}).catch(err=>{
  console.error(err)
})
