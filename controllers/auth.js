var express               = require('express');
var User                  = require('../models/user.js');
var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var passport              = require('passport');
var bodyParser            = require("body-parser");


var router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//Login controller
router.post("/login", function(req, res){

});

//index page
router.get("/",function(req,res){
  res.render("index.ejs");
});

//register controller
router.post("/register", function(req, res){
    //create new user from request's form
    var newUser = new User({email     : req.body.email,
                            firstname : req.body.firstname
    });

    //register new user to users collection
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("index.ejs", {error: "Register Failed"});
        }
        else{
          //log in the new user
          passport.authenticate("local")(req, res, function(){
            res.send("Account created successfully! You are now logged in.");
          });
        }
    });

    console.log("registration complete");
});

module.exports = router;
