var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var Post       = require('./../models/post.js');
var Comment    = require('./../models/comment.js');
var middleware = require("./../helpers/auth_middleware.js");
var knn = require("./../helpers/knn_recommendation.js")

var router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//user's home page with his news feed
router.get("/home",middleware.isLoggedIn,function(req,res){

  knn.kNearestNeighboors(3,req.session.Auth);

  User.findOne({_id: req.session.Auth._id},function(err,user){
    if(err) return res.send(err);
    user.populate("friends",function (err,populatedUser) {
      //find all posts with author the auth user or his friends then populate them
      Post.find({$or: [
        { author : req.session.Auth._id}, //auth's posts
        { author : { $in : req.session.Auth.friends}} //auth's friends' posts
      ]})
      .populate("author comments")
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          model: 'User'
        }
      })
      .exec(function(err,postsPopulated){
        if(err) return res.send(err);
        res.render("home.ejs",{user: populatedUser, posts: postsPopulated});
      });
    });
    });
  });


// .populate({
//      path: 'pages',
//      populate: {
//        path: 'components',
//        model: 'Component'
//      }
//   })
//user makes new post
router.post("/home",middleware.isLoggedIn,function(req,res){
  var newPost = new Post({
    author: req.session.Auth._id,
    text: req.body.postarea,
    likes: [],
    comments: []
  });

  if(req.files.p_media){

    var fileType = req.files.p_media.name.split(".").pop();
    console.log(fileType);
    newPost.media.content = "/post_media/"+ newPost._id + "." + fileType;
    newPost.media.mediatype = req.files.p_media.mimetype;
    req.files.p_media.mv(__dirname + "/../user_data/post_media/"  +newPost._id + "." + fileType, function(err) {
      if(err)
        return res.status(500).send(err);
      console.log("Uploaded media successfully!\n")
    });
  }
  //save new post to database and redirect to get method to load the new post
  //TODO: dont redirect but load div with jquery
  Post.collection.save(newPost,function(err,doc){
    if(err) res.send(err);
    else
      res.redirect("/home");
  });
});

//user likes a post
router.put("/home/like/:postid",middleware.isLoggedIn,function (req,res){
  Post.findOneAndUpdate({_id : req.params.postid},
                        // { $switch: {
                        //     branches: [
                        //       {case: {$nin : {likes: req.session.Auth._id }}, then: {$push: {likes:req.session.Auth._id}}},
                        //       {case: {$in : {likes: req.session.Auth._id }}, then: {$pull: {likes:req.session.Auth._id}}},
                        //     ]
                        //   }
                        // },
                        {$addToSet: {likes: req.session.Auth._id}},
                        function(err){
                          if(err) res.send(err);
                          res.redirect("/home");
                        });


});

//user comments a post
router.post("/home/comment/:postid",middleware.isLoggedIn,function (req,res) {
  //create new comment
  var newComment = new Comment({
    user: req.session.Auth._id,
    content: req.body.commentInput
  });

  //save new comment in database
  Comment.collection.save(newComment,function(err,doc){
    if(err) res.send(err);
    //update post's comments
    Post.findOneAndUpdate(
      {_id : req.params.postid},
      {$push : {comments : newComment._id}},
      {new: true},
      function(err, updated){
        if(err) res.send(err);
        //redirect again to home
        res.redirect("/home");
      }
    );
  });
});

module.exports = router;
