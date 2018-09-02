var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    email    : String,
    password : String,
    firstname: String,
    lastname : String,
    birthdate: Date,
    tel      : String,
    image    : String,
    isAdmin  : {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'})

module.exports = mongoose.model("User", UserSchema);
