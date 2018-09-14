var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

var router     = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//user's own full profile
router.get("/profile",middleware.isLoggedIn,function(req,res){
  User.findOne({_id: req.session.Auth._id}, function(err,foundUser){
    if(err) return res.send(err);
    else{
      foundUser.populate("friends", function(err, populatedUser){
        return res.render("ownProfile.ejs",{user: req.session.Auth, showUser: populatedUser});
      });
    }
  });
});

//get user profile with id
router.get("/profile/:id",middleware.isLoggedIn,function(req,res){
  //TODO if admin or friend show full profile else show public
  //if Auth._id friends with params.id or auth.isAdmin == true
  User.findOne({_id:req.params.id}, function(err,foundUser){
    if(err) return res.send(err);
    //user requested is found
    else{
      //if user is admin
      if(req.session.Auth.isAdmin == true)
        return res.render("profile.ejs",{user: req.session.Auth, showUser: foundUser, showPrivate: true});

      //check if the user requested is friends with the user that made the request(Auth user)
      var result = foundUser.friends.find(req.session.Auth._id);
      if(!result) //if users are not friends, show public profile
        return res.render("profile.ejs",{user: req.session.Auth, showUser: foundUser, showPrivate: false});
      else{ //if users ARE friends, show private profile
        //populate User's friends to view images
        foundUser.populate("friends", function(err, populatedUser){
          return res.render("profile.ejs",{user: req.session.Auth, showUser: populatedUser, showPrivate: true});
        });
      }

    }
  });
});

//User updates his bio
router.put("/profile/update/:field",middleware.isLoggedIn,function(req,res){
  var field = req.params.field;
  //console.log(req.body.info);
  if(field == "bio"){
    User.findOneAndUpdate({_id: req.session.Auth._id},
      {$set: {bio: req.body.info}},
      {new: true},
      function(err,updatedUser){
        if(err) return res.send(err);
        req.session.Auth = updatedUser;
        console.log(req.session.Auth);
        return res.redirect("/profile");
      });
  }
  else if(field == "work") {
    User.findOneAndUpdate({_id: req.session.Auth._id},
      {$set: {workPosition: req.body.info}},
      {new: true},
      function(err,updatedUser){
        if(err) return res.send(err);
        req.session.Auth = updatedUser;
        console.log(req.session.Auth);
        return res.redirect("/profile");
      });
  }
  else if(field == "education") {
    User.findOneAndUpdate({_id: req.session.Auth._id},
      {$set: {education: req.body.info}},
      {new: true},
      function(err,updatedUser){
        if(err) return res.send(err);
        req.session.Auth = updatedUser;
        console.log(req.session.Auth);
        return res.redirect("/profile");
      });
  }
  else if(field == "company") {
    User.findOneAndUpdate({_id: req.session.Auth._id},
      {$set: {company: req.body.info}},
      {new: true},
      function(err,updatedUser){
        if(err) return res.send(err);
        req.session.Auth = updatedUser;
        console.log(req.session.Auth);
        return res.redirect("/profile");
      });
  }
  else if(field == "skills") {
    console.log(req.body);
    User.findOneAndUpdate({_id: req.session.Auth._id},
      {$push: {skills: req.body.selectedSkill}},
      {new: true},
      function(err,updatedUser){
        if(err) return res.send(err);
        req.session.Auth = updatedUser;
        console.log(req.session.Auth);
        return res.redirect("/profile");
      });
  }
});

module.exports = router;
