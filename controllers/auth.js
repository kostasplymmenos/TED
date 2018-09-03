var express               = require('express');
var User                  = require('../models/user.js');
var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var passport              = require('passport');
var bodyParser            = require("body-parser");

var router = express.Router();


//Login controller

router.post('/login', function(req, res, next) {
  console.log(req.body);
  passport.authenticate("local", function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      console.log("NOOO.body");
      // *** Display message without using flash option
      // re-render the login form with a message
      return res.render('index.ejs', { error: info.message })
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/home/' + user._id);
    });
  })(req, res, next);
});

router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

//index page
router.get("/",function(req,res){
  res.render("index.ejs",{error:""});
});

//register page
router.get("/register",function(req,res){
  res.render("register.ejs");
});

//register controller
router.post("/register", function(req, res){
    //create new user from request's form
    var newUser = new User({email     : req.body.username,
                            firstname : req.body.firstname,
                            lastname  : req.body.lastname,
                            birthdate : req.body.birthdate
    });

    //register new user to users collection
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("index.ejs", {error: "Register Failed"});
        }
        else{
          //log in the new user
          passport.authenticate("local")(req, res, function(){
            res.redirect("home/" + user._id);
          });
        }
    });

    console.log("registration complete");
});

module.exports = router;
