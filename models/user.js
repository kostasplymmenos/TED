var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    email    : String,
    password : String,
    firstname: String,
    lastname : String,
    birthdate: Date,
    image    : { type: String, default: "/default_profile.jpg"},
    telephone: String,
    education: { text: String, isPrivate: {type: Boolean, default: true}},
    skills   : { skillsArray: [ {type: String} ], isPrivate: {type: Boolean, default: true}},
    bio      : { text: String, isPrivate: {type: Boolean, default: true}},
    workPosition : { text: String, isPrivate: {type: Boolean, default: true}},
    company  : { text: String, isPrivate: {type: Boolean, default: true}},
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
      //_id = id tou chat sto Chat model
      userId : {type : Schema.Types.ObjectId, ref: "User"}
    }],
    notifications: [{
      text: {type: String}  //describes the notification
    }]
});
UserSchema.plugin(passportLocalMongoose,{usernameField:"email"});

UserSchema.statics.serializeUser = function() {
    return function(user, cb) {
        cb(null, user._id);
    }
};

UserSchema.statics.deserializeUser = function() {
    var self = this;

    return function(id, cb) {
        self.findOne({_id: id}, cb);
    }
};

module.exports = mongoose.model("User", UserSchema);
