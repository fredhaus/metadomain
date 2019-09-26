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
        price: Number
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
