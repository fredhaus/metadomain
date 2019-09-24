const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: String, // validation for email probably, unique
    password: String, // required
    slackID: String,
    githubID: String,
    facebookID: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
