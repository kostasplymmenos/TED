var express               = require('express');
var User                  = require('../models/user.js');
var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var passport              = require('passport');
var bodyParser            = require("body-parser");

//setting up router
var router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//upload image
var fileUpload = require('express-fileupload');
router.use(fileUpload());

//login controller
router.post('/login', function(req, res, next) {
  //locally authenticate user's legitimacy
  passport.authenticate("local", function(err, user, info) {
    if(err)
      return next(err);
    if(!user)
      return res.render('err.ejs', { error: info.message });

    //log in user
    req.logIn(user, function(err){
      if(err)
        return next(err);
      //store logged in user data to a "global" variable
      req.session.Auth = user;
      if(user.isAdmin)
        return res.redirect('/admin/' + user._id);
      //else is normal user
      console.log("[INFO] User logged in: " + req.session.Auth.email);
      console.log(user);
      return res.redirect('/home/' + user._id);
    });
  })(req, res, next);
});

//logout controller
router.get("/logout", function(req, res){
  console.log("[INFO] User Logged Out: " + req.session.Auth.email);
  //terminate user session
  req.logout();
  res.redirect("/");
});

//index controller
router.get("/",function(req,res){
  //landing page, error for potential user authentication errors
  res.render("index.ejs",{error:""});
});

//register controller (get)
router.get("/register",function(req,res){
  //registration page, error for potential registration errors
  res.render("register.ejs",{error : ""});
});

//register controller (post)
router.post("/register", function(req, res){
  //check if password and passwordCheck are the same
  if(req.body.password != req.body.passwordCheck)
    return res.render("register.ejs", {error: "Password don't match"});


  //create new user from request's form
  var newUser = new User({email     : req.body.username,
                          firstname : req.body.firstname,
                          lastname  : req.body.lastname,
                          birthdate : req.body.birthdate
  });
  if(req.files.pic)
      newUser.image = "/profile_images/"+newUser._id+".jpg";

  console.log("image : "+newUser.image);

  //register new user to users collection (via mongoose)
  User.register(newUser, req.body.password, function(err, user){
    if(err)
      return res.render("index.ejs", {error: "Register Failed"+ err});
    else{
      //download image to server (if any was uploaded)
      if(req.files.pic){
        req.files.pic.mv(__dirname+"/../user_data/profile_images/"+user._id+".jpg", function(err) {
          if(err)
            return res.status(500).send(err);
          console.log("Uploaded image successfully!\n")
        });
      }

      //log in the new user
      passport.authenticate("local")(req, res, function(err){
        if(err)
          return res.render("index.ejs",{error: err});
        req.session.Auth = user;
        //redirect to logged user's home page
        console.log("[INFO] User Registered Succesfully: " + req.session.Auth.email);
        res.redirect("home/" + user._id);
      });
    }
  });
});

module.exports = router;
