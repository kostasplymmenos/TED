var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    email    : String,
    password : String,
    firstname: String,
    lastname : String,
    birthdate: Date,
    image    : {type: String, default: "/default_profile.jpg"},
    isAdmin  : {type: Boolean, default: false},
    friendRequests : [{
      type: mongoose.Schema.Types.ObjectId, ref: "User"
    }]
});

UserSchema.plugin(passportLocalMongoose,{usernameField:"email"});

module.exports = mongoose.model("User", UserSchema);
