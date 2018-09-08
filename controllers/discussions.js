var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var Chat       = require('./../models/chat.js');
var middleware = require("./../helpers/auth_middleware.js");

var router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//when user clicks to chat with user id2
router.get("/discussions/:id/chat/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //whole user (with id2) needs to be passed
  //find user with id2
  User.findOne({_id: req.params.id2},function (err,userFound){
    if(err)
      return res.render("err.ejs",{error: err});
    else {
      //find user with id in order to populate his chats to show at left column
      User.findOne({ _id: req.params.id}).populate("chats.userId").exec(
        function(err, populatedUser) {
          if(err) return res.send(err);

          //find tuple of auth user's chats array(the one that describes auth user's discussion with user with id2)
          var result = populatedUser.chats.find(tuple => tuple.userId._id == req.params.id2);
          if(!result){ //if there is no previous chat with user with id2
            var foundChat = new Chat({}); //create empty chat to pass to discussions.ejs
            res.render("discussions.ejs",{user : populatedUser, chat:foundChat, chatUser: userFound});
          }
          else{ //previous chat with user with id2 was found
            Chat.findOne({_id : result._id}, function(err, foundChat){
              if(err) return res.send(err);
              //chat with the user id2 found so return their messages
              res.render("discussions.ejs",{user : populatedUser, chat:foundChat, chatUser: userFound});
            });
          }
      });
    }
  });
});

router.put("/discussions/:id/send/:id2",middleware.isLoggedIn,middleware.userAccess,function (req,res) {
  // find if the two users have a chat already in order to make new or not
  User.findOne({$and: [
     { _id : req.session.Auth._id},
     { "chats.userId": req.params.id2},
  ]},
    function (err,userFound) {
    if(err) return res.render("err.js",{error: err});

    //if they have not, make a new one
    if(!userFound){
      console.log("[INFO] Chat with user ids:" +req.session.Auth._id + " and " + req.params.id2 + " not found. Creating new.\n");
      //create new chat and insert to chat collection
      //then insert respective chat id to users
      var newChatId = new mongoose.Types.ObjectId();
      var newChat = new Chat({
        _id: newChatId,
        messages:[{sender: req.params.id,content: req.body.message}]
      });
      Chat.collection.save(newChat,function(err,doc){
        if(err) return res.send(err);
        else{
          //update users (1st the one with id then the one with id2)
          //_id of new chat at user's chats array is the _id of chat at Chat model
          User.findOneAndUpdate(
            {_id : req.session.Auth._id},
            {$push :{chats : {_id : newChatId, userId : req.params.id2 }}},
            {new : true}, //return updated document
            function(err, updatedUser1){
              if(err) return res.send(err);
              else{
                //update user locally for consistency with database
                req.session.Auth = updatedUser1;
                //update user with id2
                User.findOneAndUpdate(
                  {_id : req.params.id2},
                  {$push :{chats : {_id : newChatId, userId : req.session.Auth._id }}},
                  function(err, updatedUser2){
                    if(err) return res.send(err);
                    else{
                      //find respective chat
                      Chat.findOne({_id: newChatId},function(err,retChat){
                        updatedUser1.populate("chats.userId",function(err, populatedUser){
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
    //chat already exists
    else{
      //populate user
      userFound.populate("chats.userId", function(err, populatedUser){
        //find record with userId == id2
        var result = populatedUser.chats.find(tuple => tuple.userId._id == req.params.id2);
        //find chat at database and update it with the new message, then render discussions.ejs
        Chat.findOneAndUpdate({_id : result._id},
          {$push : {messages : {sender: req.params.id,content: req.body.message}}},
          {new: true},
        function(err,updatedChat){
          User.findOne({_id: req.params.id2},function(err,user2){
            res.render("discussions.ejs",{user : populatedUser, chatUser: user2, chat: updatedChat});
          });
        });
      });
    }
  });
});

module.exports = router;
