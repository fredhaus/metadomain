var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/user");

const passport = require("passport");

// GET /login
router.get("/login", function(req, res, next) {
  res.render("auth/login");
});

// GET /signup
router.get("/signup", function(req, res, next) {
  res.render("auth/signup");
});

// POST /signup
router.post("/signup", (req, res, next) => {
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  let email = req.body.email;

  User.create({
    email: email,
    password: hashPass
  }).then(() => {
    res.redirect("/");
  });
});

// POST /login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, function(err) {
      if (req.session.search) {
        User.findOneAndUpdate(
          { _id: req.user._id },
          { $push: { searches: req.session.search } }
        ).then(() => {
          return res.redirect("/");
        });
      }
    });
  })(req, res, next);
});

// GET /logout
router.get("/logout", (req, res, next) => {
  req.logOut();
  res.redirect("/");
});

module.exports = router;
