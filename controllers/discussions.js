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
      User.findOne({ _id: req.params.id}).populate("chats").exec(
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

// router.get("/discussions/:id/chat/:id2",middleware.isLoggedIn,middleware.userAccess,function(req,res){
//   //whole user (with id2) needs to be passed
//   User.findOne({_id: req.params.id2},function (err,userFound){
//     if(err){
//       return res.render("err.ejs",{error: err});
//     }
//     else {
//       User.findOne({ _id: req.params.id}).populate("chats").exec(
//         function(err, finalUser) {
//           console.log("~~~~~~~~~~~fuser\n"+finalUser);
//           if(err){
//             return res.send(err);
//           }
//           else{
//             res.render("discussions.ejs",{user : finalUser, chatUser: userFound });
//           }
//         }
//       );
//     }
//   });
// });

router.put("/discussions/:id/send/:id2",middleware.isLoggedIn,middleware.userAccess,function (req,res) {

  User.findOne({chats:{userId: req.params.id2}},function (err,userFound) {
    if(err){
      return res.render("err.js",{error: err});
    }
    // new chat
    if(!userFound){
      //create new chat and insert to chat collection
      var newChat = new Chat({
        sender: req.params.id,
        content: req.body.message
      });
      Chat.collection.insert(newChat,function(){
        if(err){
          res.send(err);
        }else {
          console.log("new chat inserted");
        }
      });

      //update user with id
      User.findOneAndUpdate(
        {_id: req.session.Auth._id},
        { $push: {chats : {chatId : newChat._id, userId : req.params.id2 }}},
        function(err,userUpdated) {
          console.log("~~~~~~~~~~~~~~\n" + userUpdated);
          req.session.Auth = userUpdated;
          if(err){
            res.send(err);
          }
          else {
            console.log("pushed id1");
          }
          //update user with id2
          User.updateOne(
            {_id: req.params.id2},
            { $push: {chats : {chatId : newChat._id, userId : req.params.id }}},
            function(err) {
              if(err){
                res.send(err);
              }else {
                console.log("pushed id2");
                User.findOne({_id: req.params.id2},function (err,userFound){
                  if(err){
                    return res.render("err.ejs",{error: err});
                  }
                  else {
                    User.findOne({_id: req.params.id},function(err,userUpdated){
                      if(err){
                        res.send(err);
                      }
                      //console.log(userUpdated);
                      //req.session.Auth = userUpdated;
                      res.render("discussions.ejs",{user : req.session.Auth, chatUser: userFound});
                    });
                  }
                });
              }
            }
          );
        }
      );
    }
    else{

    }

  });
});

module.exports = router;
