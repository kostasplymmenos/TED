var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");
var fs = require('fs');
var objtoXML = require('object-to-xml');

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
router.post("/admin/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  var usersArr = [];
  User.find({_id: { "$ne": req.session.Auth._id }},function(err,netUserFound){
    if(err){
       console.log(err);
    }
    else {
      netUserFound.forEach(function(nuser){
        usersArr.push(objtoXML(nuser.toObject()));
      });

      // fs.open('/userData.xml', 'w+', function(err,fd) {
      //   if(err) {
      //     return console.log(err);
      //   }
      // });
      fs.writeFile("./userData.xml" ,usersArr.toString(), function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
        res.redirect("/admin/" + req.session.Auth._id);
      });
    }
  });
});



module.exports = router;
