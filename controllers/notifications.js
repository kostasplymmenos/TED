var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

var router     = express.Router();

router.use(bodyParser.urlencoded({extended: true}));

router.get("/notifications/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
    //var query = req.session.Auth.friendRequests;
    User.findOne({ _id: req.session.Auth._id}).populate("friendRequests").exec({
      function(err,user) {
        console.log(user);
        res.render("notifications.ejs",{user: user});
      }
    });
    //console.log(query);
    //User.find({_id: query },function(err,friendRequestUsers){
    //  res.render("notifications.ejs",{user: req.session.Auth,freqUsers: friendRequestUsers});
    //});
});

module.exports = router;
