var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

router.use(bodyParser.urlencoded({extended: true}));

router.get("/admin/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
    var netUsers;
    User.find({_id: { "$ne": req.session.Auth._id }},function(err,netUserFound){
      netUsers = netUserFound;
      if(err){
         console.log(err);
      } else {
         res.render("admin_home.ejs",{user: req.session.Auth, networkUsers: netUsers});
      }
    });
});

module.exports = router;
