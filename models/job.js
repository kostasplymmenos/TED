var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var JobSchema = new mongoose.Schema({
  title : String,
  poster:  {type: Schema.Types.ObjectId, ref: "User"},
  postDate: {type: Date, default: Date.now},
  company: String,
  skillsRequired: [{
    type: String
  }],
  description: String,
  usersApplied: [{
    type: Schema.Types.ObjectId, ref: "User"
  }],
  jobType: String,
  location: String
});

module.exports = mongoose.model("Job", JobSchema);
