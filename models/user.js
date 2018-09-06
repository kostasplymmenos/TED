var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    email    : String,
    password : String,
    firstname: String,
    lastname : String,
    birthdate: Date,
    image    : {type: String, default: "/default_profile.jpg"},
    isAdmin  : {type: Boolean, default: false},
    friendRequestsSent : [{
      type: Schema.Types.ObjectId, ref: "User"
    }],
    friendRequestsPending : [{
      type: Schema.Types.ObjectId, ref: "User"
    }],
    friends : [{
      type: Schema.Types.ObjectId, ref: "User"
    }],
    chats :[{
      chatId : {type : Schema.Types.ObjectId, ref: "Chat"},
      userId : {type : Schema.Types.ObjectId, ref: "User"}
    }]
});
UserSchema.plugin(passportLocalMongoose,{usernameField:"email"});

module.exports = mongoose.model("User", UserSchema);
