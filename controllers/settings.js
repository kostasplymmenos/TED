var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");
var passportLocalMongoose = require("passport-local-mongoose");
var passport              = require('passport');

router.use(bodyParser.urlencoded({extended: true}));

router.get("/settings",middleware.isLoggedIn,function(req,res){
  res.render("settings.ejs",{user: req.session.Auth});
});

router.put("/settings/:id/email",middleware.isLoggedIn,function(req,res,next){
  //TODO change email to database when user logs out -- Passport Hell with authentication
  User.findOne({_id: req.session.Auth._id},function(err,foundUser){
    if (foundUser){
      req.session.Auth.email = req.body.newEmail;
      foundUser.set("email",req.body.newEmail);
      foundUser.save();
      return res.redirect("/settings/"+req.session.Auth._id);

    }
    else
      return res.status(500).json({message: 'This user does not exist'});

  });
});

router.put("/settings/:id/telephone",middleware.isLoggedIn,function(req,res){
  User.findOneAndUpdate({_id: req.params.id},
    {$set: {telephone: req.body.newTel}},
    {new: true},
    function(err,user) {
      req.session.Auth = user;
      return res.redirect("/settings/"+req.session.Auth._id);
    });
});

router.put("/settings/:id/password",middleware.isLoggedIn,function(req,res){
  User.findOne({_id: req.session.Auth._id},function(err,foundUser){
    if (foundUser){
      foundUser.setPassword(req.body.newpass, function(){
        foundUser.save();
        return res.redirect("/settings/"+req.session.Auth._id);
      });
    }
    else
      return res.status(500).json({message: 'This user does not exist'});

  });

});

module.exports = router;
