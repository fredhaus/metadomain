var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/user");
const zxcvbn = require("zxcvbn");

const passport = require("passport");

// GET /login
router.get("/login", function(req, res, next) {
  if (!req.session.searches) {
    req.session.searches = [];
  }

  res.render("auth/login");
});

// GET /signup
router.get("/signup", function(req, res, next) {
  if (!req.session.searches) {
    req.session.searches = [];
  }
  res.render("auth/signup");
});

// POST /signup
router.post("/signup", (req, res, next) => {
  let email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Indicate username and password"
    });
    return;
  } else if (zxcvbn(req.body.password).score < 2) {
    res.render("auth/signup", { errorMessage: "Indicate stronger password" });
  }

  User.findOne({ email }).then(user => {
    if (user !== null) {
      res.render("auth/signup", {
        errorMessage: "The username already exists"
      });
      return;
    } else {
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      User.create({
        email: email,
        password: hashPass
      }).then((user) => {
        req.logIn(user, function(err) {
          User.findOneAndUpdate(
            { _id: req.user._id },
            { $push: { searches: req.session.searches } }
          ).then(() => {
            res.redirect("/");
          });
        });
      });
    }
  });
});

// POST /login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.render("auth/login", {
        errorMessage: "The username does not exist"
      });
      return;
    }
    req.logIn(user, function(err) {
      User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { searches: req.session.searches } }
      ).then(() => {
        return res.redirect("/");
      });
    });
  })(req, res, next);
});

// GET /logout
router.get("/logout", (req, res, next) => {
  req.logOut();
  res.redirect("/");
});

module.exports = router;
