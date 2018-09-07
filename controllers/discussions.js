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
      User.findOne({ _id: req.params.id}).populate("chats.userId").exec(
        function(err, populatedUser) {
          //console.log("~~~~~populated user :\n");
          //console.log(populatedUser);
          if(err){
            return res.send(err);
          }
          //find index of chats array
          //console.log(populatedUser.chats);
          var result = populatedUser.chats.find(tuple => tuple.userId._id == req.params.id2);
          //console.log("RESULT:\n");
          //console.log(result);
          if(!result){
            var foundChat = new Chat({});
            res.render("discussions.ejs",{user : populatedUser, chat:foundChat, chatUser: userFound});
          }
          else {
            Chat.findOne({_id : result._id}, function(err, foundChat){
              //console.log("~~~~~~~~~~~Found Chat:\n");
              //console.log(foundChat);
              if(err) console.log("err");
              res.render("discussions.ejs",{user : populatedUser, chat:foundChat, chatUser: userFound});
            });
          }
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

    // if they have not make a new one
    if(!userFound){
      console.log("~~~~~~~~~Chat with this user not found. Creating new.\n");
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
          //update users (1st the one with id then the one with id2)
          //_id of new chat at user's chats array is the _id of chat at Chat model
          User.findOneAndUpdate(
            {_id : req.session.Auth._id},
            {$push :{chats : {_id : newChatId, userId : req.params.id2 }}},
            {new : true},
            function(err, updatedUser1){
              if(err) console.log(err);
              else{
                //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~!@~!#~#~!@~@~!#@~!@#~!!");
                //console.log(updatedUser1);
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
                        updatedUser1.populate("chats.userId",function(err, populatedUser){
                          ///console.log("~~~~~populated user after send message:\n");
                          //console.log(populatedUser);
                          res.render("discussions.ejs",{user : populatedUser, chatUser: updatedUser2, chat: retChat});
                        });
                      });
                    }
                });
              }
          });
        }
      });
    }
    //chat exists
    else{
      console.log("~~~~~~~~Chat found already with this user\n");

      //populate user
      userFound.populate("chats.userId", function(err, populatedUser){
          //find record with userId == id2
          var result = populatedUser.chats.find(tuple => tuple.userId._id == req.params.id2);
          //result._id is the chat id we want

          Chat.findOneAndUpdate({_id : result._id},
            {$push : {messages : {sender: req.params.id,content: req.body.message}}},
            {new: true},
          function(err,updatedChat){
            User.findOne({_id: req.params.id2},function(err,user2){
              res.render("discussions.ejs",{user : populatedUser, chatUser: user2, chat: updatedChat});
            });

          });
      });




      //console.log("RESULT:\n");
      //console.log(result);
      // userFound.populate("chats.userId",function(err, populatedUser){
      //   var result = populatedUser.chats.find(tuple => tuple.userId._id == req.params.id2);
      // }
      // Chat.updateOne({_id: userFound.},function(err,doc){
      //
      // });
    }

  });
});

module.exports = router;
