var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var passportLocalMongooseEmail = require('passport-local-mongoose-email');

var UserSchema = new mongoose.Schema({
    email    : String,
    password : String,
    firstname: String,
    lastname : String,
    birthdate: Date,
    image    : {type: String, default: "/default_profile.jpg"},
    isAdmin  : {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose,{usernameField:"email"});

module.exports = mongoose.model("User", UserSchema);
