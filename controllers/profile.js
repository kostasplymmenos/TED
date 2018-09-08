var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

var router     = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//get user with id profile page
router.get("/profile/:id",middleware.isLoggedIn,function(req,res){
  User.find({_id:req.params.id}, function(err,foundUser){
    if(err) return res.send(err);
    else
      res.render("profile.ejs",{user: req.session.Auth, showUser: foundUser[0]});
  });
});

module.exports = router;
