const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  post:          { type: mongoose.Schema.Types.ObjectId, required: true },
  onModel:       { type: String, enum: ["Post", "Reel"], default: "Post" },
  user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:          { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  replies:       [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  likes:         [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
