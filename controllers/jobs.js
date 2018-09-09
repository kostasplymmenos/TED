var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

router.use(bodyParser.urlencoded({extended: true}));

//main page for user's network
router.get("/jobs/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  res.render("jobs.ejs",{user: req.session.Auth});
});

module.exports = router;
