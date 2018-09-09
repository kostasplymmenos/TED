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

router.get("/settings/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  res.render("settings.ejs",{user: req.session.Auth});
});

router.put("/settings/:id/email",middleware.isLoggedIn,middleware.userAccess,function(req,res,next){
  //TODO change email to database when user logs out -- Passport Hell with authentication
  res.render("settings.ejs",{user: req.session.Auth});
});

router.put("/settings/:id/telephone",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  User.findOneAndUpdate({_id: req.params.id},
    {$set: {telephone: req.body.newTel}},
    {new: true},
    function(err,user) {
      req.session.Auth = user;
      res.render("settings.ejs",{user: req.session.Auth});
    });
});

router.put("/settings/:id/password",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  res.render("settings.ejs",{user: req.session.Auth});
});

module.exports = router;
