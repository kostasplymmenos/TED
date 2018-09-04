var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

router.use(bodyParser.urlencoded({extended: true}));

router.get("/profile/:id",middleware.isLoggedIn,function(req,res){

  User.find({_id:req.params.id}, function(err,foundUser){

      if(err){
         console.log(err);
      } else {
         res.render("profile.ejs",{user: req.session.Auth, showUser: foundUser[0]});
      }

  });
});

module.exports = router;
