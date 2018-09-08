var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

var router     = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//get notifications (friend requests and network notifications)
router.get("/notifications/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //find and show friend requests
  User.findOne({ _id: req.session.Auth._id}).populate("friendRequestsPending").exec(
    function(err,users) {
      if(err) return res.send(err);
      res.render("notifications.ejs",{user: req.session.Auth,friendreq: users.friendRequestsPending});
    }
  );
});

module.exports = router;
