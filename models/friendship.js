var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var friendshipSchema = new mongoose.Schema({
  friend1: mongoose.Schema.Types.ObjectId,
  friend2: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model("Friendship", friendshipSchema);
