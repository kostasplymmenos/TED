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
    User.find({$and: [
                       { _id: {$ne : req.session.Auth._id}},
                       { _id : { $nin : req.session.Auth.friendRequestsMade}},
                       { _id : { $nin : req.session.Auth.friendRequestsPending}}
                     ]}, function(err, usersfinal){

                       if(err){
                          console.log(err);
                       }
                       else {
                          res.render("network.ejs",{user: req.session.Auth, friends: req.session.Auth.friends,networkUsers: usersfinal});
                       }

    });
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
      { $push: {friendRequestsPending: req.session.Auth._id}},
      function(err) {
        User.updateOne(
          {_id: req.session.Auth._id},
          { $push: {friendRequestsSent: req.params.id2}},
          function(err) {

          }
        );
      }
    );
    res.redirect("/network/" + req.session.Auth._id);
});

router.post("/network/:id/accept/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //user with id2 sent request to user with id
  //add user with id to user with id2
  //at callback, add user with id2 to user with id
  console.log("EKANEREEEEE");
  User.updateOne({ $and: [
                     {_id: req.params.id2},{ $push: {friends: req.params.id}},
                     {_id: req.params.id2},{ $pull: {friendsRequestsSent: req.params.id}}
                   ]},
                   function(err) {
                      if(err)
                        return res.send(err);
                      User.updateOne({ $and: [
                                         {_id: req.params.id},{ $push: {friends: req.params.id2}},
                                         {_id: req.params.id},{ $pull: {friendsRequestsPending: req.params.id2}}
                                       ]},
                                        function(err) {
                                          res.redirect("/notifications/" + req.session.Auth._id);
      });
    });
});

router.post("/network/:id/decline/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){

});

module.exports = router;
