var express = require('express');
var app = express();
var router = express.Router();


router.get("/home/:id",function(req,res){
  res.render("home.ejs");
});
