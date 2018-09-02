var express = require('express');
var app = express();
var router = express.Router();
var User = require('../models/user.js');
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var passport      = require('passport');

router.get("/",function(req,res){
  res.render("index.ejs");
});

//Login controller
router.post("/login", function(req, res){

});

//Sign Up controlelr
router.post("/register", function(req, res){
  console.log(req.body);
    var newUser = new User({email     : req.body.email,
                            firstname : req.body.firstname,
                            lastname  : req.body.lastname
    });
    console.log("user made");
    //TODO check if email already exists
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log("ERRRO");
            return res.render("index.ejs", {error: "Register Failed"});
        }
        else{
          passport.authenticate("local")(req, res, function(){
            console.log("mphke sto pssport auth");
            res.redirect("/");
          });
        }
    });

    console.log("after register");
});


module.exports = router;
