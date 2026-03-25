const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  // Can reference either a Post or a Reel — use refPath for polymorphism
  post:     { type: mongoose.Schema.Types.ObjectId, required: true },
  onModel:  { type: String, enum: ["Post", "Reel"], default: "Post" },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:     { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
