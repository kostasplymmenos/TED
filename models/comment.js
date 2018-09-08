var mongoose = require("mongoose");

var CommentSchema = new mongoose.Schema({
  user: {type: Schema.Types.ObjectId, ref: "User"},
  content : String,
  date: {type:Date, default: Date.now}
});

module.exports = mongoose.model("Comment", CommentSchema);
