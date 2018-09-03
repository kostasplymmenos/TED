var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

router.use(bodyParser.urlencoded({extended: true}));

router.get("/network/:id",middleware.isLoggedIn,function(req,res){
  var netUsers;
  User.find({},function(err,netUserFound){
    netUsers = netUserFound;
  });
  console.log(netUsers);
  User.find({_id:req.params.id}, function(err,foundUser){
    if(err){
       console.log(err);
    } else {
       res.render("network.ejs",{user: foundUser[0],networkUsers: netUsers});
    }
  });
});

module.exports = router;
