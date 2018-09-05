var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

var router     = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

router.get("/notifications/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
    User.findOne({ _id: req.session.Auth._id}).populate("friendRequestsPending").exec(
      function(err,users) {
        if(err){
          return res.send(err);
        }
        console.log(users);
        res.render("notifications.ejs",{user: req.session.Auth,friendreq: users.friendRequestsPending});
      }
    );
    //console.log(query);
    //User.find({_id: query },function(err,friendRequestUsers){
    //  res.render("notifications.ejs",{user: req.session.Auth,freqUsers: friendRequestUsers});
    //});
});

module.exports = router;
