var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

var router     = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//get notifications (friend requests and network notifications)
router.get("/notifications",middleware.isLoggedIn,function(req,res){
  //find and show friend requests
  User.findOne({ _id: req.session.Auth._id}).populate("friendRequestsPending").exec(
    function(err,users) {
      if(err) return res.send(err);
      res.render("notifications.ejs",{user: req.session.Auth,friendreq: users.friendRequestsPending});
    }
  );
});

//deletes notification with _id = req.params.note_id
router.delete("/notifications/delete/:note_id",function(req,res){
  User.findOneAndUpdate(
    {_id : req.session.Auth._id},
    {$pull : {notifications : {_id : req.params.note_id}}},
    {new :true},
    function(err, userUpdated){
      req.session.Auth = userUpdated;
      if(err)res.render("err.ejs");
      res.redirect("/notifications");
    });
});

module.exports = router;
