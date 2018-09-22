var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var User = require('./../models/user.js');
var Job = require('./../models/job.js');
var middleware = require("./../helpers/auth_middleware.js");

router.use(bodyParser.urlencoded({extended: true}));

//main page for user's network
router.get("/jobs",middleware.isLoggedIn,function(req,res){
  var showJobs = [];
  Job.find({},function (err,jobsFound) {
    //sort jobs according to auth's skills (most relevant appear first)
    jobsFound.forEach(function(job){
      req.session.Auth.skills.skillsArray.forEach(function(userskill){
        if(job.skillsRequired.includes(userskill)){
          showJobs.push(job);
        }
      });
    });
    res.render("jobs.ejs",{user: req.session.Auth, jobs: showJobs, message : ""});
  })
});

//view more details of a job
router.get("/jobs/show/:job_id", middleware.isLoggedIn,function(req,res){
  //find respective job in database
  Job.findOne({_id : req.params.job_id}, function(err, jobFound){
    if(err) return res.render("err.ejs",{error: err});
    if(!jobFound) return res.send("job was not found");
    else //job was found
      res.render("jobDetails.ejs",{user: req.session.Auth, job : jobFound});
  });
});

//if someone applies
router.post("/jobs/apply/:job_id", middleware.isLoggedIn,function(req,res){
  //update job at database
  Job.findOneAndUpdate({_id : req.params.job_id},
    {$push: {usersApplied : req.session.Auth._id}},
    function(err, found){
      if(err || !found) return res.send("Failed to apply. Please try again.");
      res.redirect("/jobs");
    }
  );

});

router.get("/jobs/jobsPosted",middleware.isLoggedIn,function(req,res){
  Job.find({poster: req.session.Auth._id},function (err,jobsFound) {
    if(err) return res.send(err);
    res.render("jobsPosted.ejs",{user: req.session.Auth, jobs: jobsFound});
  });
});


router.get("/jobs/newJob",middleware.isLoggedIn,function(req,res){
  res.render("newJob.ejs",{user: req.session.Auth});
});

router.post("/jobs/newJob",middleware.isLoggedIn,function(req,res){
  console.log(req.body);
  var newJob = new Job({
    title: req.body.title,
    poster: req.session.Auth._id,
    location: req.body.location,
    company: req.body.company,
    description: req.body.description,
    jobType: req.body.jobType,
    skillsRequired: req.body.skills.split("\r\n")

  });
  console.log("[INFO] New Job Created");
  Job.collection.save(newJob,function(err,doc){
    if(err) return res.send(err);
    else
      res.redirect("/jobs");
  });
});

module.exports = router;
