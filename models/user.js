const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: String, // validation for email probably, unique
    password: String, // required
    slackID: String,
    githubID: String,
    appleID: String,
    searches: [
      {
        domain: String,
        ending: String,
        redirectURL: String,
        price: Number,
        host: String,
        available: Boolean,
        timestamp: Number,
        SearchDate: String,
        SearchTime: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
