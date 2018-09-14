var express    = require('express');
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var User       = require('./../models/user.js');
var middleware = require("./../helpers/auth_middleware.js");
var fs         = require('fs');
var objtoXML   = require('object-to-xml'); // for exporting user data to xml

//setting up router
var router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));

//admin's main page
router.get("/admin",middleware.isLoggedIn,function(req,res){
    //find all users of connectedin except admin
    User.find({_id: { "$ne": req.session.Auth._id }},function(err,netUserFound){
      if(err)
         return res.render("err.js",{error: err});
      else
         return res.render("admin_home.ejs",{user: req.session.Auth, networkUsers: netUserFound});
    });
});

//export user data TODO: select user and select which attributes to export
router.get("/admin/export",middleware.isLoggedIn,middleware.userAccess,function(req,res){
  //to store users in XML object form
  //will be exported in the end
  var usersArr = [];

  //find all users of database(except admin)
  User.find({_id: { "$ne": req.session.Auth._id }},function(err,netUserFound){
    if(err)
       return res.send(err);
    else {
      //push each user's data in xml form to usersArr
      netUserFound.forEach(function(nuser){
        usersArr.push(objtoXML(nuser.toObject()));
      });

      //write file to server's data
      var pathToExport = "./userData.xml";
      fs.writeFile(pathToExport ,usersArr.toString(), function(err) {
        if(err)
          return res.render("err.js",{error: err});
        console.log("XML data exported successfully to "+ pathToExport);
        return res.redirect("/admin");
      });
    }
  });
});

module.exports = router;
