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
  let reeamil = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,6})?$/;
  let email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Indicate username and password"
    });
    return;
  } else if (!reeamil.test(email)) {
    res.render("auth/signup", {
      errorMessage: "Please enter valid email address"
    });
  } else if (zxcvbn(req.body.password).score < 2) {
    let warning = zxcvbn(req.body.password).feedback.warning;
    let suggestion = zxcvbn(req.body.password).feedback.suggestions[0];

    res.render("auth/signup", {
      errorMessage: "Indicate stronger password",
      warning: warning,
      suggestion: suggestion
    });
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
      }).then(user => {
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

// GET /user
router.get("/user", (req, res, next) => {
  if (req.user) {
    searchesObj = req.user.searches;
    // res.locals.currentUser = req.user;
    res.render("auth/user", { searchesObj: searchesObj });
  } else {
    res.redirect("/login");
  }
});

// GET /admin
router.get("/admin", (req, res, next) => {
  if (req.user) {
    if (req.user.email === "admin@istrator.com") { 
      // adminID - needs to be set up on database once// p4$$w0rd
      searchesObj = req.user.searches;
      res.render("auth/admin", { searchesObj: searchesObj});
    }
    
    else {
      // res.redirect("index", {errorMessage: "You are not authorized to acces this area"});
      res.render("index", {errorMessage: "You are not authorized to acces this area", title: "Metadomain Search", user: req.user})
    }

  } else {
    // res.redirect("/login");
    res.render("auth/login", {
      errorMessage: "You are not authorized to acces this area"
    });
  }
});

module.exports = router;
