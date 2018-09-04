var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

router.use(bodyParser.urlencoded({extended: true}));

router.get("/network/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
    var netUsers;
    //User.find( {"$and": [ {_id:{"$ne": req.session.Auth._id}}, {_id:{"$ne": req.session.Auth.friendRequests}} ] },function(err,netUserFound){
    User.find({_id : {"$ne" : req.session.Auth._id }}, function(err, users1){
      users1.find({_id : {"$ne" : req.session.Auth.friendRequests }}, function(err, usersfinal){
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log(usersfinal);
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      })
    })
});
//           netUsers = netUserFound;
//           if(err){
//              console.log(err);
//           } else {
//              res.render("network.ejs",{user: req.session.Auth, networkUsers: netUsers});
//           }});
// });

//
// function(err,netUserFound){
//   netUsers = netUserFound;
//   if(err){
//      console.log(err);
//   } else {
//      res.render("network.ejs",{user: req.session.Auth, networkUsers: netUsers});
//   }
// Person.
//   find({ occupation: /host/ }).
//   where('name.last').equals('Ghost').
//   where('age').gt(17).lt(66).
//   where('likes').in(['vaporizing', 'talking']).
//   limit(10).
//   sort('-occupation').
//   select('name occupation').
//   exec(callback);

// Send friend request from id to id2
router.post("/network/:id/new/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){
    // find user with id2 and push a friend request to his array
    User.updateOne(
      {_id: req.params.id2},
      { $push: {friendRequests: req.session.Auth._id}},
      function(err) {
      }
    );
    res.redirect("/network/" + req.session.Auth._id);
});

module.exports = router;
