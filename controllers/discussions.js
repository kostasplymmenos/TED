var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var Chat       = require('./../models/chat.js');
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
      // POPULATE CHATS TO SHOW OTHER CHATS AT LEFT OF THE SCREEN
      User.findOne({ _id: req.params.id}).populate("chats").exec(
        function(err, populatedUser) {
          if(err){
            return res.send(err);
          }
          //find index of chats array
          var result = populatedUser.chats.find(tuple => tuple.userId == req.params.id2);
          Chat.findOne({_id : result._id}, function(err, foundChat){
            if(err) console.log("err");
            res.render("discussions.ejs",{user : populatedUser, chat:foundChat, chatUser: userFound});
          });
      });
    }
  });
});  


router.put("/discussions/:id/send/:id2",middleware.isLoggedIn,middleware.userAccess,function (req,res) {

  // find if the two users have a chat already
  User.findOne({$and: [
     { _id : req.session.Auth._id},
     { "chats.userId": req.params.id2},
  ]},
    function (err,userFound) {
    if(err){
      return res.render("err.js",{error: err});
    }
    console.log("~~~~~~~~~chat found\n");
    console.log(userFound);

    // if they have not make a new one
    if(!userFound){
      //create new chat and insert to chat collection
      //then insert respective chat id to users
      var newChatId = new mongoose.Types.ObjectId();
      var newChat = new Chat({
        _id: newChatId,
        messages:[{sender: req.params.id,content: req.body.message}]
      });
      Chat.collection.save(newChat,function(err,doc){
        if(err){
          res.send(err);
        }else {
          console.log("new chat inserted. Chat : \n");
          //update users (1st the one with id then the one with id2)
          //_id of new chat at user's chats array is the _id of chat at Chat model
          User.findOneAndUpdate(
            {_id : req.session.Auth._id},
            {$push :{chats : {_id : newChatId, userId : req.params.id2 }}},
            {returnNewDocument : true},
            function(err, updatedUser1){
              if(err) console.log(err);
              else{
                req.session.Auth = updatedUser1;
                //update user with id2
                User.findOneAndUpdate(
                  {_id : req.params.id2},
                  {$push :{chats : {_id : newChatId, userId : req.session.Auth._id }}},
                  {returnNewDocument : true},
                  function(err, updatedUser2){
                    if(err)
                      console.log(err);
                    else{
                      Chat.findOne({_id: newChatId},function(err,retChat){
                        res.render("discussions.ejs",{user : updatedUser1, chatUser: updatedUser2, chat: retChat})
                      });
                    }
                });
              }
          });
        }
      });
    }
    else{
      console.log("Chat found already\n");
      // Chat.updateOne({_id: userFound.},function(err,doc){
      //
      // });
    }

  });
});

module.exports = router;
