var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/user");
const zxcvbn = require("zxcvbn");
const _ = require("lodash");

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
  } else {
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
  }
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
    res.render("auth/user", { user: req.user, searchesObj: searchesObj});
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
      allEndings = [];
      endingStats = {};
      for (let index = 0; index < searchesObj.length; index++) {
        const element = searchesObj[index];
        // console.log(element.ending)
        if (
          !allEndings.includes(element.ending) &&
          typeof element.ending !== "undefined"
        ) {
          allEndings.push(element.ending);
        }
      }

      for (let index = 0; index < allEndings.length; index++) {
        const element = allEndings[index];
        endingStats[element] = 0;
        for (let index = 0; index < searchesObj.length; index++) {
          const element2 = searchesObj[index];
          if (element2.ending === element) {
            endingStats[element] += 1;
          }
        }
      }

      totalSearchesLength = searchesObj.length
      let nameComCount = 0
      let gandiCount = 0
      let nameSiloCount = 0

      searchesObj.forEach(element => {
        if (element.host === "nameCom"){
          nameComCount++
        }
        if (element.host === "gandi"){
          gandiCount++
        }
        if (element.host === "namesilo"){
          nameSiloCount++
        }
      });

      cheapestHost = [{host: "nameCom", nr: nameComCount},{host: "gandi", nr: gandiCount}, {host: "namesilo", nr: nameSiloCount}]
      cheapestHostSorted = _.sortBy(cheapestHost, [{"nr" : "desc"}]);
      
      console.log(cheapestHostSorted)
      
      res.render("auth/admin", {user: req.user, searchesObj: searchesObj , endingStats: endingStats, totalSearchesLength: totalSearchesLength, cheapestHostSorted: cheapestHostSorted})
    } else {
      // res.redirect("index", {errorMessage: "You are not authorized to acces this area"});
      res.render("index", {
        errorMessage: "You are not authorized to acces this area",
        title: "Metadomain Search",
        user: req.user
      });
    }
  } else {
    // res.redirect("/login");
    res.render("auth/login", {
      errorMessage: "You are not authorized to acces this area"
    });
  }
});

module.exports = router;
