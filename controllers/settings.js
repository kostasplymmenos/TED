var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

router.use(bodyParser.urlencoded({extended: true}));

router.get("/settings/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  res.render("settings.ejs",{user: req.session.Auth});
});

module.exports = router;
