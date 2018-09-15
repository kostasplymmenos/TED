var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
  author: {type: Schema.Types.ObjectId, ref: "User"},
  text  : String,
  media : {content: String, mediatype: String},
  likes : [{
    type: Schema.Types.ObjectId, ref: "User"
  }],
  comments : [{
    type: Schema.Types.ObjectId, ref: "Comment"
  }],
  date: {type:Date, default: Date.now}

});

module.exports = mongoose.model("Post", PostSchema);
