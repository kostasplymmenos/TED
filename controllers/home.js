var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var Post       = require('./../models/post.js');
var middleware = require("./../helpers/auth_middleware.js");

var router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//user's home page with his news feed
router.get("/home/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //find all posts with author the auth user or his friends then populate them
  Post.find({$or: [
    { author : req.session.Auth._id},
    { author : { $in : req.session.Auth.friends}}
  ]}).populate("author")
  .exec(function(err,postsPopulated){
    if(err) return res.send(err);
    res.render("home.ejs",{user: req.session.Auth, posts: postsPopulated});
  });
});

//user makes new post
router.post("/home/:id",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  var newPost = new Post({
    author: req.session.Auth._id,
    text: req.body.postarea,
    likes: [],
    comments: []
  });
  //save new post to database and redirect to get method to load the new post
  //TODO: dont redirect but load div with jquery
  Post.collection.save(newPost,function(err,doc){
    if(err) res.send(err);
    else
      res.redirect("/home/"+req.session.Auth._id);
  });
});

//user likes a post
router.put("/home/like/:postid",middleware.isLoggedIn,middleware.userAccess,function (req,res) {
  res.redirect("/home/"+req.session.Auth._id);
});

module.exports = router;
