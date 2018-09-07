var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ChatSchema = new mongoose.Schema({
  messages : [{
    sender: {type: Schema.Types.ObjectId, ref: "User" },
    content: {type: String},
    date: {type:Date, default: Date.now}
  }]
});

module.exports = mongoose.model("Chat", ChatSchema);
