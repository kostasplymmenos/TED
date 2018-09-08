var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

router.use(bodyParser.urlencoded({extended: true}));

//main page for user's network
router.get("/network/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //show users to add except friends,user and user's friend requests
  User.find({$and: [
    { _id: {$ne : req.session.Auth._id}},
    { _id : { $nin : req.session.Auth.friendRequestsSent}},
    { _id : { $nin : req.session.Auth.friendRequestsPending}},
    { _id : { $nin : req.session.Auth.friends}}
  ]},
    function(err, usersfinal){
      //populate friends to show info about them
      User.findOne({ _id: req.session.Auth._id}).populate("friends").exec(
        function(err,frs) {
          if(err) return res.send(err);
          res.render("network.ejs",{user: req.session.Auth,friends: frs.friends ,networkUsers: usersfinal});
        }
      );
  });
});

//Send friend request from id to id2
router.post("/network/:id/new/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //find user with id2 and push a friend request of id to his array
  User.updateOne(
    {_id: req.params.id2},
    { $push: {friendRequestsPending: req.session.Auth._id}},
    function(err) {
      //find user with id and push a friend request of id2 to his array
      User.updateOne(
        {_id: req.session.Auth._id},
        { $push: {friendRequestsSent: req.params.id2}},
        //TODO dont find return updated doc
        function(err) {
          User.findOne({_id: req.params.id},function(err,userUpdated){
            if(err) res.send(err);
            //update user locally to show friend requests
            req.session.Auth = userUpdated;
            res.redirect("/network/" + req.session.Auth._id);
          });
        }
      );
    }
  );
});

//accept friend request
router.put("/network/:id/accept/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //user with id2 sent request to user with id
  //add user with id to user with id2
  //at callback, add user with id2 to user with id
  User.updateOne({_id: req.params.id2},
    {$push: {friends: req.params.id},
    $pull: {friendRequestsSent: req.params.id}},
    function(err) {
      if(err) return res.send(err);
        User.updateOne({_id: req.params.id},
          {$push: {friends: req.params.id2},
          $pull: {friendRequestsPending: req.params.id2}},
          function(err) {
            User.findOne({_id: req.params.id},function(err,userUpdated){
              req.session.Auth = userUpdated;
              res.redirect("/notifications/" + req.session.Auth._id);
            });
        });
  });
});

router.post("/network/:id/decline/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){

});

module.exports = router;
