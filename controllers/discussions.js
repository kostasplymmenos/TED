var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");

var router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

router.get("/discussions/:id/chat/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //whole user (with id2) needs to be passed
  User.findOne({_id: req.params.id2},function (err,userFound){
    if(err){
      return res.render("err.ejs",{error: err});
    }
    else {
      User.findOne({ _id: req.session.Auth._id}).populate("chats").exec(
        function(err, finalUser) {
          if(err){
            return res.send(err);
          }
          res.render("discussions.ejs",{user : finalUser, chatUser: userFound});
        }
      );
    }
  });
});

router.put

module.exports = router;

// User.findOne({chats.userId: req.params.id2},function (err,userFound) {
//   if(err){
//     return res.render("err.js",error: err);
//   }
//   // new chat
//   if(!userFound){
//     //create new chat and insert to chat collection
//     var newChat = new Chat({});
//     Chat.collection.insert(newChat,function{
//       if(err){
//         res.send(err);
//       }else {
//         console.log("new chat inserted");
//       }
//     });
//
//     //update user with id
//     User.updateOne(
//       {_id: req.session.Auth._id},
//       { $push: {chats : {chatId : newChat._id, userId : req.params.id2 }}},
//       function(err) {
//         if(err){
//           res.send(err);
//         }else {
//           console.log("pushed ");
//         }
//       }
//     );
//
//     //update user with id2
//
//
//   }
//   else{
//
//   }
