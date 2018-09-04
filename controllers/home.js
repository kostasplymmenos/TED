var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

var router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

router.get("/home/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
    User.find({_id:req.params.id}, function(err,foundUser){
      if(err){
         console.log(err);
      } else {
         res.render("home.ejs",{user: foundUser[0]});
      }
    });
});

module.exports = router;
