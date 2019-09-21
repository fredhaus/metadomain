var http = require("https");

var options = {
  method: "GET",
  hostname: "api.gandi.net",
  port: "443",
  path: "/v5/domain/check?name=hendrik1000001.com",
  headers: {
    authorization: "Apikey u74Ptic6ozNFCIgPNnHxD5Wi"
  }
};
console.log("moin");

var req = http.request(options, function(res) {
  var chunks = [];

  res.on("data", function(chunk) {
    chunks.push(chunk);
  });

  res.on("end", function() {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();
